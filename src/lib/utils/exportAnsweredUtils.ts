import type { UserAnswer, Option } from '#lib/types.js';

export function exportAttemptedQuestionsAsText(userAnswers: UserAnswer[]) {
	if (!userAnswers || userAnswers.length === 0) {
		alert('No attempted questions found to export!');
		return;
	}

	let output = '';

	userAnswers.forEach((ans) => {
		const q = ans.question;
		const setIdentifier = q.setTitle || q.setId || 'Exported-Set';

		output += `---
SetId: ${q.setId || 'attempted-export'}
Title: ${setIdentifier}
Category: grammar
Tags: attempted, review
`;

		if (q.contextText) {
			output += `ContextPassages: ${q.contextText}\n`;
		}
		if (q.contextEnglishText) {
			output += `ContextEnglish: ${q.contextEnglishText}\n`;
		}

		output += '\n';

		// Question block
		output += `1. ${q.prompt}\n`;
		q.options.forEach((opt: string | Option, oIdx: number) => {
			const optText = typeof opt === 'string' ? opt : `${opt.text} - ${opt.english}`;
			output += `   ${oIdx + 1}) ${optText}\n`;
		});

		if (q.english) output += `English: ${q.english}\n`;
		if (q.kanji) output += `Kanji: ${q.kanji}\n`;
		if (q.reading) output += `Reading: ${q.reading}\n`;
		if (q.kanjiReading) output += `KanjiReading: ${q.kanjiReading}\n`;
		output += `ContextIdx: ${q.contextIdx ?? 0}\n\n`;

		// Answer Key based on the question's actual correct answer
		output += 'Answer Key:\n';
		output += `1. ${q.answer + 1}\n\n`;
	});

	// Trigger file download
	const blob = new Blob([output.trim()], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `attempted_questions_export_${Date.now()}.txt`;
	link.click();
	URL.revokeObjectURL(url);
}
