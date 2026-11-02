import type { UserAnswer, Option } from '#lib/types.js';

/**
 * Exports only the user answers that match the given filter criteria.
 * @param userAnswers All user answers
 * @param filterFn Optional predicate function to filter which answers should be exported
 */
export function exportAttemptedQuestionsAsText(
	userAnswers: UserAnswer[], 
	filterFn?: (ans: UserAnswer, index: number) => boolean
) {
	if (!userAnswers || userAnswers.length === 0) {
		alert('No attempted questions found to export!');
		return;
	}

	// Apply filter if provided, otherwise use all answers
	const filteredAnswers = filterFn ? userAnswers.filter(filterFn) : userAnswers;

	if (filteredAnswers.length === 0) {
		alert('No questions match the current filters to export!');
		return;
	}

	let output = '';

	filteredAnswers.forEach((ans, idx) => {
		const q = ans.question;
		const setIdentifier = q.setTitle || q.setId || 'Exported-Set';

		const userChoiceIdx = typeof ans.selected === 'number' ? ans.selected : -1;
		const correctIdx = q.answer; // 0-based index
		const isCorrect = userChoiceIdx >= 0 && userChoiceIdx === correctIdx;

		output += `============================================================\n`;
		output += `QUESTION ${idx + 1}\n`;
		output += `Set ID: ${q.setId || 'attempted-export'}\n`;
		output += `Title: ${setIdentifier}\n`;
		output += `Result: ${isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}\n`;
		output += `------------------------------------------------------------\n`;

		if (q.contextText) {
			output += `Context: ${q.contextText}\n`;
		}
		if (q.contextEnglishText) {
			output += `Context English: ${q.contextEnglishText}\n`;
		}
		if (q.contextText || q.contextEnglishText) {
			output += `\n`;
		}

		output += `Prompt: ${q.prompt}\n\n`;
		output += `Options:\n`;

		q.options.forEach((opt: string | Option, oIdx: number) => {
			const optText = typeof opt === 'string' ? opt : `${opt.text} - ${opt.english}`;
			const isUserSelected = oIdx === userChoiceIdx;
			const isCorrectOpt = oIdx === correctIdx;

			const markers: string[] = [];
			if (isUserSelected) markers.push('YOUR CHOICE');
			if (isCorrectOpt) markers.push('CORRECT ANSWER');

			const markerStr = markers.length > 0 ? `  [${markers.join(' | ')}]` : '';
			output += `   ${oIdx + 1}) ${optText}${markerStr}\n`;
		});

		output += `\n`;
		if (q.english) output += `English: ${q.english}\n`;
		if (q.kanji) output += `Kanji: ${q.kanji}\n`;
		if (q.reading) output += `Reading: ${q.reading}\n`;
		if (q.kanjiReading) output += `KanjiReading: ${q.kanjiReading}\n`;

		const userOptText = userChoiceIdx >= 0 && userChoiceIdx < q.options.length 
			? `${userChoiceIdx + 1}) ${typeof q.options[userChoiceIdx] === 'string' ? q.options[userChoiceIdx] : (q.options[userChoiceIdx] as Option).text}` 
			: 'None selected';
		
		const correctOptText = correctIdx >= 0 && correctIdx < q.options.length 
			? `${correctIdx + 1}) ${typeof q.options[correctIdx] === 'string' ? q.options[correctIdx] : (q.options[correctIdx] as Option).text}` 
			: 'Unknown';

		output += `\nReview Summary:\n`;
		output += ` * Your Answer:    ${userOptText}\n`;
		output += ` * Correct Answer: ${correctOptText}\n`;
		output += ` * Status:         ${isCorrect ? 'CORRECT' : 'WRONG'}\n\n`;
	});

	output += `============================================================\n`;

	// Trigger file download
	const blob = new Blob([output.trim()], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `filtered_attempted_questions_${Date.now()}.txt`;
	link.click();
	URL.revokeObjectURL(url);
}