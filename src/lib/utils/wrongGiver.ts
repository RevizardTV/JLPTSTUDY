import { get } from 'svelte/store';
import { userProgress } from '#lib/stores.ts';
import type { QuestionSet, Question, UserAnswer, SetProgress } from '#lib/types.js';

export function exportVisibleMissedQuestionsAsText(filteredSets: QuestionSet[]): string {
	const progressStore = get(userProgress);
	const missedEntries: Array<{ question: Question; selectedIdx: number }> = [];

	// 1. Gather all missed questions along with the user's selected option
	filteredSets.forEach((set) => {
		const stats = progressStore.completedSets[set.id] as SetProgress | undefined;
		if (!stats || !stats.userAnswers) return;

		stats.userAnswers.forEach((ans: UserAnswer) => {
			if (!ans.isCorrect) {
				// Ensure no duplicate prompts if attempted multiple times
				if (!missedEntries.some((e) => e.question.prompt === ans.question.prompt)) {
					missedEntries.push({
						question: { ...ans.question, setTitle: set.title },
						selectedIdx: ans.selected
					});
				}
			}
		});
	});

	if (missedEntries.length === 0) {
		return 'No incorrect questions found across the currently filtered visible sets!';
	}

	// 2. Format into custom text contract format with selected option noted
	let output = '--- \n';
	output += 'SetId: visible-filtered-mistakes-review\n';
	output += 'Title: Review of Filtered Missed Questions\n';
	output += 'Category: grammar\n';
	output += 'Tags: review, mistakes, filtered\n';
	output += 'ContextPassages: フィルターされた表示中のセットにおける間違いの復習リストです。\n';
	output +=
		'ContextEnglish: This is a review list of mistakes from the currently filtered visible sets.\n\n';

	missedEntries.forEach((entry, index) => {
		const q = entry.question;
		output += `${index + 1}. ${q.prompt}\n`;

		q.options.forEach((opt, optIdx) => {
			const isSelected = optIdx === entry.selectedIdx;
			const selectionMarker = isSelected ? ' [SELECTED WRONG]' : '';

			if (typeof opt === 'string') {
				output += `   ${optIdx + 1}) ${opt} - N/A${selectionMarker}\n`;
			} else {
				output += `   ${optIdx + 1}) ${opt.text} - ${opt.english || 'N/A'}${selectionMarker}\n`;
			}
		});

		if (q.english) output += `   English: ${q.english}\n`;
		if (q.kanji) output += `   Kanji: ${q.kanji}\n`;
		if (q.reading) output += `   Reading: ${q.reading}\n`;
		if (q.kanjiReading) output += `   KanjiReading: ${q.kanjiReading}\n`;
		output += `   SelectedOption: ${entry.selectedIdx + 1}\n`;
		output += `   ContextIdx: ${q.contextIdx || 0}\n\n`;
	});

	// Generate Answer Key
	output += 'Answer Key:\n';
	missedEntries.forEach((entry, index) => {
		output += `${index + 1}. ${entry.question.answer + 1}${index < missedEntries.length - 1 ? ', ' : ''}`;
	});
	output += '\n\n---';

	return output;
}
