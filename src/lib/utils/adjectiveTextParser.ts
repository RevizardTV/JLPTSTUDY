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
			const kanaStem = kana.trim();
			const eng = meaning.trim();
			const rom = romaji ? romaji.trim() : '';

			const isGoodException = stem === 'いい' || stem === '良い';

			adjItems.push({
				id: stem + '_' + Math.random().toString(36).substr(2, 4),
				dictionary: stem,
				reading: kanaStem,
				english: eng,
				category: isNaAdj ? 'na-adj' : 'i-adj',
				forms: isNaAdj
					? {
							nonPast: {
								formName: 'Non-Past Polite',
								kanji: stem + 'です',
								kana: kanaStem + 'です',
								romaji: rom ? rom + ' desu' : 'desu',
								english: eng
							},
							past: {
								formName: 'Past Polite',
								kanji: stem + 'でした',
								kana: kanaStem + 'でした',
								romaji: rom ? rom + ' deshita' : 'deshita',
								english: 'was ' + eng
							},
							negative: {
								formName: 'Negative Polite',
								kanji: stem + 'ではありません',
								kana: kanaStem + 'ではありません',
								romaji: rom ? rom + ' dewa arimasen' : 'dewa arimasen',
								english: 'not ' + eng
							},
							pastNegative: {
								formName: 'Past Negative Polite',
								kanji: stem + 'ではありませんでした',
								kana: kanaStem + 'ではありませんでした',
								romaji: rom ? rom + ' dewa arimasen deshita' : 'dewa arimasen deshita',
								english: 'was not ' + eng
							},
							adverbial: {
								formName: 'Adverbial Form',
								kanji: stem + 'に',
								kana: kanaStem + 'に',
								romaji: rom ? rom + ' ni' : 'ni',
								english: 'ly / to become'
							},
							attributive: {
								formName: 'Attributive Form',
								kanji: stem + 'な',
								kana: kanaStem + 'な',
								romaji: rom ? rom + ' na' : 'na',
								english: eng + ' (modifies noun)'
							}
						}
					: {
							nonPast: {
								formName: 'Non-Past Polite',
								kanji: stem + 'です',
								kana: kanaStem + 'です',
								romaji: rom ? rom + 'i desu' : 'i desu',
								english: eng
							},
							past: {
								formName: 'Past Polite',
								kanji: isGoodException ? 'よかったです' : stem.slice(0, -1) + 'かったです',
								kana: isGoodException ? 'よかったです' : kanaStem.slice(0, -1) + 'かったです',
								romaji: isGoodException
									? 'yokatta desu'
									: (rom ? rom.slice(0, -1) : '') + 'katta desu',
								english: 'was ' + eng
							},
							negative: {
								formName: 'Negative Polite',
								kanji: isGoodException ? 'よくないです' : stem.slice(0, -1) + 'くないです',
								kana: isGoodException ? 'よくないです' : kanaStem.slice(0, -1) + 'くないです',
								romaji: isGoodException
									? 'yokunai desu'
									: (rom ? rom.slice(0, -1) : '') + 'kunai desu',
								english: 'not ' + eng
							},
							pastNegative: {
								formName: 'Past Negative Polite',
								kanji: isGoodException ? 'よくなかったです' : stem.slice(0, -1) + 'くなかったです',
								kana: isGoodException
									? 'よくなかったです'
									: kanaStem.slice(0, -1) + 'くなかったです',
								romaji: isGoodException
									? 'yokunakatta desu'
									: (rom ? rom.slice(0, -1) : '') + 'kunakatta desu',
								english: 'was not ' + eng
							},
							adverbial: {
								formName: 'Adverbial Form (ku-form)',
								kanji: isGoodException ? 'よく' : stem.slice(0, -1) + 'く',
								kana: isGoodException ? 'よく' : kanaStem.slice(0, -1) + 'く',
								romaji: isGoodException ? 'yoku' : (rom ? rom.slice(0, -1) : '') + 'ku',
								english: 'ly (connective)'
							},
							attributive: {
								formName: 'Attributive Form',
								kanji: stem,
								kana: kanaStem,
								romaji: rom,
								english: eng + ' (base form)'
							}
						}
			});
		}
	}

	return adjItems;
}
