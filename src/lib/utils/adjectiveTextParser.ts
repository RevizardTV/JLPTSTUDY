// src/lib/utils/adjectiveTextParser.ts
import type { AdjItem } from '#lib/types/grammar.js';

export function parseAdjectiveTextToItems(content: string): AdjItem[] {
	const lines = content.split(/\r?\n/);
	const adjItems: AdjItem[] = [];

	for (const line of lines) {
		const stripped = line.trim();
		if (!stripped) continue;

		if (/^(Adjectives?|List)[:\s]*/i.test(stripped)) {
			continue;
		}

		// Expected format: 大きい (おおきい) [ookii] - big (i-adj, n5)
		const match = stripped.match(
			/^([^\s（(]+)\s*[（(]([^）)]+)[）)]\s*(?:\[([^\]]+)\])?\s*[-–—:]\s*(.+?)(?:\s*\(([^)]+)\))?$/
		);

		if (match) {
			const [, dictionary, kana, romaji, meaning, tagsStr] = match;
			const isNaAdj = tagsStr ? tagsStr.toLowerCase().includes('na') : false;
			const stem = dictionary.trim();

			adjItems.push({
				id: stem + '_' + Math.random().toString(36).substr(2, 4),
				dictionary: stem,
				reading: kana.trim(),
				english: meaning.trim(),
				category: isNaAdj ? 'na-adj' : 'i-adj',
				forms: isNaAdj
					? {
							nonPast: {
								formName: 'Non-Past (Polite)',
								kanji: stem + 'です',
								kana: kana.trim() + 'です',
								romaji: (romaji || '') + ' desu',
								english: meaning.trim()
							},
							past: {
								formName: 'Past (Polite)',
								kanji: stem + 'でした',
								kana: kana.trim() + 'でした',
								romaji: (romaji || '') + ' deshita',
								english: 'was ' + meaning.trim()
							},
							negative: {
								formName: 'Negative (Polite)',
								kanji: stem + 'ではありません',
								kana: kana.trim() + 'ではありません',
								romaji: (romaji || '') + 'ではありません',
								english: 'not ' + meaning.trim()
							},
							adverbial: {
								formName: 'Adverbial Form',
								kanji: stem + 'に',
								kana: kana.trim() + 'に',
								romaji: (romaji || '') + ' ni',
								english: 'ly / to become'
							}
						}
					: {
							nonPast: {
								formName: 'Non-Past (Polite)',
								kanji: stem + 'です',
								kana: kana.trim() + 'です',
								romaji: (romaji || '') + 'i desu',
								english: meaning.trim()
							},
							past: {
								formName: 'Past (Polite)',
								kanji: stem.slice(0, -1) + 'かったです',
								kana: kana.trim().slice(0, -1) + 'かったです',
								romaji: (romaji || '') + 'katta desu',
								english: 'was ' + meaning.trim()
							},
							negative: {
								formName: 'Negative (Polite)',
								kanji: stem.slice(0, -1) + 'くないです',
								kana: kana.trim().slice(0, -1) + 'くないです',
								romaji: (romaji || '') + 'kunai desu',
								english: 'not ' + meaning.trim()
							},
							adverbial: {
								formName: 'Adverbial Form (ku-form)',
								kanji: stem.slice(0, -1) + 'く',
								kana: kana.trim().slice(0, -1) + 'く',
								romaji: (romaji || '') + 'ku',
								english: 'ly (connective)'
							}
						}
			});
		}
	}

	return adjItems;
}
