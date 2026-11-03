// src/lib/utils/verbTextParser.ts
import type { VerbItem } from '#lib/types/grammar.js';

export function parseVerbTextToItems(content: string): VerbItem[] {
	const lines = content.split(/\r?\n/);
	const verbItems: VerbItem[] = [];

	for (const line of lines) {
		const stripped = line.trim();
		if (!stripped) continue;

		if (/^(Verbs?|Actions?|List)[:\s]*/i.test(stripped)) {
			continue;
		}

		// Expected format: 食べる (たべる) [taberu] - to eat (group2, n5)
		const match = stripped.match(
			/^([^\s（(]+)\s*[（(]([^）)]+)[）)]\s*(?:\[([^\]]+)\])?\s*[-–—:]\s*(.+?)(?:\s*\(([^)]+)\))?$/
		);

		if (match) {
			const [, dictionary, kana, romaji, meaning, tagsStr] = match;
			const dictClean = dictionary.trim();
			const kanaClean = kana.trim();
			const engClean = meaning.trim();
			const romClean = romaji ? romaji.trim() : '';

			const groupNum =
				tagsStr && tagsStr.includes('1') ? 1 : tagsStr && tagsStr.includes('3') ? 3 : 2;

			verbItems.push({
				id: dictClean + '_' + Math.random().toString(36).substr(2, 4),
				dictionary: dictClean,
				reading: kanaClean,
				english: engClean,
				group: groupNum,
				forms: {
					masu: {
						formName: 'Masu (Polite Non-Past)',
						kanji: computeVerbForm(dictClean, 'masu', groupNum),
						kana: computeVerbForm(kanaClean, 'masu', groupNum),
						romaji: romClean ? romClean + 'masu' : 'masu',
						english: 'eat / will ' + engClean
					},
					masen: {
						formName: 'Masen (Polite Negative)',
						kanji: computeVerbForm(dictClean, 'masen', groupNum),
						kana: computeVerbForm(kanaClean, 'masen', groupNum),
						romaji: romClean ? romClean + 'masen' : 'masen',
						english: 'do not ' + engClean
					},
					mashita: {
						formName: 'Mashita (Polite Past)',
						kanji: computeVerbForm(dictClean, 'mashita', groupNum),
						kana: computeVerbForm(kanaClean, 'mashita', groupNum),
						romaji: romClean ? romClean + 'mashita' : 'mashita',
						english: 'did ' + engClean
					},
					masenka: {
						formName: 'Masen ka (Polite Invitation)',
						kanji: computeVerbForm(dictClean, 'masenka', groupNum),
						kana: computeVerbForm(kanaClean, 'masenka', groupNum),
						romaji: romClean ? romClean + 'masen ka' : 'masen ka',
						english: "won't you " + engClean + '?'
					},
					te: {
						formName: 'Te-Form (Connection)',
						kanji: computeVerbForm(dictClean, 'te', groupNum),
						kana: computeVerbForm(kanaClean, 'te', groupNum),
						romaji: romClean ? romClean + 'te' : 'te',
						english: engClean + ' and...'
					},
					tai: {
						formName: 'Tai-Form (Desire)',
						kanji: computeVerbForm(dictClean, 'tai', groupNum),
						kana: computeVerbForm(kanaClean, 'tai', groupNum),
						romaji: romClean ? romClean + 'tai desu' : 'tai desu',
						english: 'want to ' + engClean
					},
					potential: {
						formName: 'Potential Form',
						kanji: computeVerbForm(dictClean, 'potential', groupNum),
						kana: computeVerbForm(kanaClean, 'potential', groupNum),
						romaji: romClean ? romClean + 'reru' : 'reru',
						english: 'can ' + engClean
					},
					volitional: {
						formName: 'Volitional Form',
						kanji: computeVerbForm(dictClean, 'volitional', groupNum),
						kana: computeVerbForm(kanaClean, 'volitional', groupNum),
						romaji: romClean ? romClean + 'you' : 'you',
						english: "let's " + engClean
					}
				}
			});
		}
	}

	return verbItems;
}

function computeVerbForm(dict: string, form: string, group: number): string {
	// Exception Handling for Irregulars (Group 3 & Special Verbs)
	if (dict === 'する' || dict.endsWith('する')) {
		const pre = dict === 'する' ? '' : dict.replace('する', '');
		if (form === 'masu') return pre + 'します';
		if (form === 'masen') return pre + 'しません';
		if (form === 'mashita') return pre + 'しました';
		if (form === 'masenka') return pre + 'しませんか';
		if (form === 'te') return pre + 'して';
		if (form === 'tai') return pre + 'したいです';
		if (form === 'potential') return pre + 'できる';
		if (form === 'volitional') return pre + 'しよう';
	}

	if (dict === 'くる' || dict === '来る') {
		if (form === 'masu') return '来ます';
		if (form === 'masen') return '来ません';
		if (form === 'mashita') return '来ました';
		if (form === 'masenka') return '来ませんか';
		if (form === 'te') return '来て';
		if (form === 'tai') return '来たいです';
		if (form === 'potential') return '来られる';
		if (form === 'volitional') return '来よう';
	}

	const stem = dict.slice(0, -1);
	if (group === 1) {
		if (form === 'masu') return stem + 'きます';
		if (form === 'masen') return stem + 'きません';
		if (form === 'mashita') return stem + 'きました';
		if (form === 'masenka') return stem + 'きませんか';
		if (form === 'te') return stem + 'いて';
		if (form === 'tai') return stem + 'きたいです';
		if (form === 'potential') return stem + 'ける';
		if (form === 'volitional') return stem + 'こう';
	} else {
		// Group 2 (Ru-verbs)
		if (form === 'masu') return stem + 'ます';
		if (form === 'masen') return stem + 'ません';
		if (form === 'mashita') return stem + 'ました';
		if (form === 'masenka') return stem + 'ませんか';
		if (form === 'te') return stem + 'て';
		if (form === 'tai') return stem + 'たいです';
		if (form === 'potential') return stem + 'られる';
		if (form === 'volitional') return stem + 'よう';
	}
	return dict;
}
