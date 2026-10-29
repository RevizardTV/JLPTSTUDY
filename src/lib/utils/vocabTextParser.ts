// src/lib/utils/vocabTextParser.ts
import type { VocabItem } from '#lib/types.js';

export function parseVocabTextToItems(content: string): VocabItem[] {
	const lines = content.split(/\r?\n/);
	const vocabItems: VocabItem[] = [];

	for (const line of lines) {
		const stripped = line.trim();
		if (!stripped) continue;

		// Skip headers or comments if present
		const headerRegex = new RegExp('^(Vocab(abulary)?|New\\s*Words|List)[:\\s]*', 'i');
		if (headerRegex.test(stripped)) {
			continue;
		}

		// Format expected: Word (kana) [romaji] - Meaning (tag1, tag2)
		// Example: 明日 (あした) [ashita] - tomorrow (noun, time, n5)
		const vocabMatch = stripped.match(
			/^([^\s（(]+)\s*[（(]([^）)]+)[）)]\s*(?:\[([^\]]+)\])?\s*[-–—:]\s*(.+?)(?:\s*\(([^)]+)\))?$/
		);

		if (vocabMatch) {
			const [, w, k, r, m, tagsStr] = vocabMatch;
			const vTags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : ['n5'];
			vocabItems.push({
				word: w.trim(),
				kana: k.trim(),
				romaji: r ? r.trim() : '',
				meaning: m.trim(),
				vocabTags: vTags
			});
		} else {
			// Fallback lightweight parser if format is just "Word - Meaning" or "Word (kana) - Meaning"
			const simpleMatch = stripped.match(/^([^\s–—-]+)\s*[-–—:]\s*(.+)$/);
			if (simpleMatch) {
				const [, w, m] = simpleMatch;
				vocabItems.push({
					word: w.trim(),
					kana: w.trim(),
					romaji: '',
					meaning: m.trim(),
					vocabTags: ['n5']
				});
			}
		}
	}

	return vocabItems;
}
