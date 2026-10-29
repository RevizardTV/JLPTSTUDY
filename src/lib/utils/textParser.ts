// src/lib/utils/grammarTextParser.ts
import type { QuestionSet, Question, VocabItem } from '#lib/types.js';

export function parseGrammarTextToSets(content: string): QuestionSet[] {
	const rawBlocks = content.split(/\n\s*---\s*\n/);
	const allSets: QuestionSet[] = [];

	for (let blockIdx = 0; blockIdx < rawBlocks.length; blockIdx++) {
		const block = rawBlocks[blockIdx];
		if (!block.trim()) continue;

		const lines = block.split(/\r?\n/);

		let setId = `set-multiset-vol${blockIdx + 1}-n5`;
		let title = `Grammar & Kanji Set ${blockIdx + 1}`;
		let category = 'grammar';
		let packTitle = 'Master Batch Pack';
		let tags = ['n5', 'grammar'];
		let contextPassages: string[] = [];
		let contextEnglish: string[] = [];
		const questions: Question[] = [];
		const vocab: VocabItem[] = [];
		const answerKeyMap: Record<number, number> = {};

		let currentQ: Question | null = null;
		let mode: 'META' | 'ANSWERS' | 'VOCAB' | 'QUESTIONS' = 'META';

		for (const line of lines) {
			const stripped = line.trim();
			if (!stripped) continue;

			// Answer Key Switcher
			const answerHeaderRegex = new RegExp('^Answer\\s*Key[:\\s]*', 'i');
			if (answerHeaderRegex.test(stripped)) {
				if (currentQ) {
					questions.push(currentQ);
					currentQ = null;
				}
				mode = 'ANSWERS';
				const ansText = stripped.replace(answerHeaderRegex, '').trim();
				if (ansText) {
					const matches = [...ansText.matchAll(/(\d+)[:.]\s*([1-4])/g)];
					for (const m of matches) {
						answerKeyMap[parseInt(m[1], 10)] = parseInt(m[2], 10) - 1;
					}
				}
				continue;
			}

			// Vocab Switcher
			const vocabHeaderRegex = new RegExp('^(Vocab(abulary)?|New\\s*Words)[:\\s]*', 'i');
			if (vocabHeaderRegex.test(stripped)) {
				if (currentQ) {
					questions.push(currentQ);
					currentQ = null;
				}
				mode = 'VOCAB';
				continue;
			}

			if (mode === 'META') {
				if (/^setid:/i.test(stripped)) {
					setId = stripped.split(':', 2)[1].trim();
				} else if (/^title:/i.test(stripped)) {
					title = stripped.split(':', 2)[1].trim();
				} else if (/^category:/i.test(stripped)) {
					category = stripped.split(':', 2)[1].trim();
				} else if (/^packtitle:/i.test(stripped)) {
					packTitle = stripped.split(':', 2)[1].trim();
				} else if (/^tags:/i.test(stripped)) {
					tags = stripped
						.split(':', 2)[1]
						.split(',')
						.map((t) => t.trim());
				} else if (/^contextpassages:/i.test(stripped)) {
					contextPassages = stripped
						.split(':', 2)[1]
						.split('|')
						.map((p) => p.trim());
				} else if (/^contextenglish:/i.test(stripped)) {
					contextEnglish = stripped
						.split(':', 2)[1]
						.split('|')
						.map((e) => e.trim());
				} else if (/^\d+\.\s+/.test(stripped)) {
					mode = 'QUESTIONS';
				}
			}

			if (mode === 'ANSWERS') {
				const matches = [...stripped.matchAll(/(\d+)[:.]\s*([1-4])/g)];
				for (const m of matches) {
					answerKeyMap[parseInt(m[1], 10)] = parseInt(m[2], 10) - 1;
				}
				continue;
			}

			if (mode === 'VOCAB') {
				const vocabMatch = stripped.match(
					/^([^\s（(]+)\s*[（(]([^）)]+)[）)]\s*(?:\[([^\]]+)\])?\s*[-–—:]\s*(.+?)(?:\s*\(([^)]+)\))?$/
				);
				if (vocabMatch) {
					const [, w, k, r, m, tagsStr] = vocabMatch;
					const vTags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : ['n5'];
					vocab.push({
						word: w.trim(),
						kana: k.trim(),
						romaji: r ? r.trim() : '',
						meaning: m.trim(),
						vocabTags: vTags
					});
				}
				continue;
			}

			if (mode === 'META' || mode === 'QUESTIONS') {
				const qMatch = stripped.match(/^(\d+)\.\s+(.*)$/);
				if (qMatch) {
					if (currentQ) questions.push(currentQ);
					mode = 'QUESTIONS';
					currentQ = {
						qNum: parseInt(qMatch[1], 10),
						prompt: qMatch[2].trim(),
						contextIdx: 0,
						options: [],
						answer: 0
					};
					continue;
				}

				const optMatch = stripped.match(/^([1-4①②③④])\)\s*(.*)$/);
				if (currentQ !== null && optMatch) {
					const optContent = optMatch[2].trim();
					let text = optContent;
					let kana = optContent;
					let english = 'definition needed';
					if (optContent.includes(' - ')) {
						const parts = optContent.split(' - ', 2);
						text = parts[0].trim();
						kana = text;
						english = parts[1].trim();
					}
					currentQ.options.push({ text, kana, english });
					continue;
				}

				if (currentQ !== null) {
					if (/^kanji:/i.test(stripped)) {
						currentQ.kanji = stripped.split(':', 2)[1].trim();
					} else if (/^kanjireading:/i.test(stripped)) {
						currentQ.kanjiReading = stripped.split(':', 2)[1].trim();
					} else if (/^reading:/i.test(stripped)) {
						currentQ.reading = stripped.split(':', 2)[1].trim();
					} else if (/^english:/i.test(stripped)) {
						currentQ.english = stripped.split(':', 2)[1].trim();
					} else if (/^contextidx:/i.test(stripped)) {
						try {
							currentQ.contextIdx = parseInt(stripped.split(':', 2)[1].trim(), 10);
						} catch {
							// Ignore parsing errors
						}
					}
				}
			}
		}

		if (currentQ) questions.push(currentQ);

		// Apply answer mappings and default English sentence definitions
		for (const q of questions) {
			if (answerKeyMap[q.qNum] !== undefined) {
				q.answer = answerKeyMap[q.qNum];
			}
			if (!q.english && q.options.length > 0 && q.options[q.answer]) {
				q.english = q.options[q.answer].english;
			}
		}

		if (contextPassages.length === 0) {
			contextPassages = ['Sample reading passage.'];
		}

		const setObj: QuestionSet = {
			id: setId,
			title,
			category: category as QuestionSet['category'],
			packTitle,
			tags,
			contextPassages,
			questions,
			vocab: vocab.length > 0 ? vocab : undefined
		};

		if (contextEnglish.length > 0) {
			setObj.contextEnglish = contextEnglish;
		}

		allSets.push(setObj);
	}

	return allSets;
}
