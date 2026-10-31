import type { QuestionSet } from '#lib/types.ts';

export function exportAllQuestionsAsText(sets: QuestionSet[]) {
	let output = '';

	sets.forEach((set) => {
		const tagsString = set.tags ? set.tags.join(', ') : 'general';
		output += `---
SetId: ${set.id}
Title: ${set.title}
Category: ${set.category}
Tags: ${tagsString}
`;

		if (set.contextPassages && set.contextPassages.length > 0) {
			output += `ContextPassages: ${set.contextPassages[0]}\n`;
		}
		if (set.contextEnglish && set.contextEnglish.length > 0) {
			output += `ContextEnglish: ${set.contextEnglish[0]}\n`;
		}

		output += '\n';

		set.questions.forEach((q, idx) => {
			output += `${idx + 1}. ${q.prompt}\n`;
			q.options.forEach((opt, oIdx) => {
				const optText = typeof opt === 'string' ? opt : `${opt.text} - ${opt.english}`;
				output += `   ${oIdx + 1}) ${optText}\n`;
			});
			if (q.english) output += `English: ${q.english}\n`;
			if (q.kanji) output += `Kanji: ${q.kanji}\n`;
			if (q.reading) output += `Reading: ${q.reading}\n`;
			if (q.kanjiReading) output += `KanjiReading: ${q.kanjiReading}\n`;
			output += `ContextIdx: ${q.contextIdx ?? 0}\n\n`;
		});

		output += 'Answer Key:\n';
		const answerPairs = set.questions.map((q, idx) => `${idx + 1}. ${q.answer + 1}`).join(', ');
		output += `${answerPairs}\n\n`;

		if (set.vocab && set.vocab.length > 0) {
			output += 'Vocab:\n';
			set.vocab.forEach((v) => {
				const tagsStr = v.vocabTags ? ` (${v.vocabTags.join(', ')})` : '';
				output += `${v.word} (${v.kana}) [${v.romaji}] - ${v.meaning}${tagsStr}\n`;
			});
			output += '\n';
		}
	});

	const blob = new Blob([output.trim()], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `all_questions_export_${Date.now()}.txt`;
	link.click();
	URL.revokeObjectURL(url);
}
