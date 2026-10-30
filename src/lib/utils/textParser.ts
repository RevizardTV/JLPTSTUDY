import type { Question, QuestionSet, VocabItem } from '#lib/types.ts';

export function parseGrammarTextToSets(rawText: string): QuestionSet[] {
	const blocks = rawText
		.split(/^---/m)
		.map((b) => b.trim())
		.filter(Boolean);
	const sets: QuestionSet[] = [];

	for (const block of blocks) {
		const lines = block.split(/\r?\n/);

		let setId = '';
		let title = '';
		let category = 'grammar';
		let packTitle = '';
		let tags: string[] = [];
		let contextPassages: string[] = [];
		let contextEnglish: string[] = [];

		const questions: Question[] = [];
		const vocab: VocabItem[] = [];

		let currentQ: Question | null = null;
		let parsingSection = 'metadata'; // metadata, questions, answerKey, vocab

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmed = line.trim();
			if (!trimmed) continue;

			if (/^Answer Key:/i.test(trimmed)) {
				// Safety: Push the final active question before leaving the question section
				if (currentQ) {
					questions.push(currentQ);
					currentQ = null;
				}
				parsingSection = 'answerKey';
				continue;
			}
			if (/^Vocab:/i.test(trimmed)) {
				// Safety: Push the final active question just in case Answer Key was missing
				if (currentQ) {
					questions.push(currentQ);
					currentQ = null;
				}
				parsingSection = 'vocab';
				continue;
			}

			if (parsingSection === 'metadata') {
				if (/^SetId:/i.test(trimmed)) {
					setId = trimmed.replace(/^SetId:\s*/i, '').trim();
				} else if (/^Title:/i.test(trimmed)) {
					title = trimmed.replace(/^Title:\s*/i, '').trim();
				} else if (/^Category:/i.test(trimmed)) {
					category = trimmed.replace(/^Category:\s*/i, '').trim();
				} else if (/^PackTitle:/i.test(trimmed)) {
					packTitle = trimmed.replace(/^PackTitle:\s*/i, '').trim();
				} else if (/^Tags:/i.test(trimmed)) {
					tags = trimmed
						.replace(/^Tags:\s*/i, '')
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
				} else if (/^ContextPassages:/i.test(trimmed)) {
					const val = trimmed.replace(/^ContextPassages:\s*/i, '').trim();
					contextPassages = val ? [val] : [];
				} else if (/^ContextEnglish:/i.test(trimmed)) {
					const val = trimmed.replace(/^ContextEnglish:\s*/i, '').trim();
					contextEnglish = val ? [val] : [];
				} else if (/^\d+\./.test(trimmed)) {
					parsingSection = 'questions';
					i--;
				}
			} else if (parsingSection === 'questions') {
				const qMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
				if (qMatch) {
					if (currentQ) {
						questions.push(currentQ);
					}
					currentQ = {
						qNum: parseInt(qMatch[1], 10),
						prompt: qMatch[2].trim(),
						options: [],
						answer: 0,
						contextIdx: 0
					};
					continue;
				}

				const optMatch = trimmed.match(/^(\d+[).])\s+(.*)$/);
				if (optMatch && currentQ) {
					const optionContent = optMatch[2].trim();
					const dashSplit = optionContent.split(/\s*-\s*/);
					if (dashSplit.length >= 2) {
						currentQ.options.push({
							text: dashSplit[0].trim(),
							english: dashSplit.slice(1).join(' - ').trim(),
							kana: dashSplit[0].trim()
						});
					} else {
						currentQ.options.push({
							text: optionContent,
							kana: optionContent,
							english: 'N/A'
						});
					}
					continue;
				}

				if (currentQ) {
					const kvMatch = trimmed.match(/^([a-zA-Z]+):\s*(.*)$/);
					if (kvMatch) {
						const key = kvMatch[1].toLowerCase();
						const value = kvMatch[2].trim();

						if (key === 'english') {
							currentQ.english = value;
						} else if (key === 'kanji') {
							currentQ.kanji = value;
						} else if (key === 'reading') {
							currentQ.reading = value;
						} else if (key === 'kanjireading') {
							currentQ.kanjiReading = value;
						} else if (key === 'contextidx') {
							currentQ.contextIdx = parseInt(value, 10) || 0;
						}
					}
				}
			} else if (parsingSection === 'answerKey') {
				const pairs = trimmed.split(/,|\s+/);
				for (let p = 0; p < pairs.length; p++) {
					const token = pairs[p].replace('.', '').trim();
					const nextToken = pairs[p + 1]?.trim();

					const qNum = parseInt(token, 10);
					const ansNum = parseInt(nextToken, 10);

					if (!isNaN(qNum) && !isNaN(ansNum)) {
						const targetQ = questions.find((q) => q.qNum === qNum);
						if (targetQ) {
							targetQ.answer = ansNum - 1;
						}
						p++;
					}
				}
			} else if (parsingSection === 'vocab') {
				const vocabMatch = trimmed.match(/^([^()]+)\(([^)]+)\)(?:\s*\[([^\]]+)\])?\s*-\s*(.+)$/);
				if (vocabMatch) {
					const word = vocabMatch[1].trim();
					const kana = vocabMatch[2].trim();
					const romaji = vocabMatch[3] ? vocabMatch[3].trim() : '';
					let rest = vocabMatch[4].trim();

					let vocabTags: string[] = [];
					const tagMatch = rest.match(/\(([^)]+)\)$/);
					if (tagMatch) {
						vocabTags = tagMatch[1].split(',').map((t) => t.trim());
						rest = rest.replace(/\([^)]+\)$/, '').trim();
					}

					vocab.push({
						word,
						kana,
						romaji,
						meaning: rest,
						vocabTags
					});
				}
			}
		}

		// Catch any trailing active question at the end of the block
		if (currentQ) {
			questions.push(currentQ);
		}

		if (questions.length > 0) {
			sets.push({
				id: setId || `set-${Math.random().toString(36).substring(2, 9)}`,
				title: title || 'Untitled Set',
				category: category || 'grammar',
				packTitle: packTitle || undefined,
				tags: tags.length > 0 ? tags : ['general'],
				contextPassages: contextPassages.length > 0 ? contextPassages : [''],
				contextEnglish: contextEnglish.length > 0 ? contextEnglish : undefined,
				questions,
				vocab: vocab.length > 0 ? vocab : undefined
			});
		}
	}

	return sets;
}
