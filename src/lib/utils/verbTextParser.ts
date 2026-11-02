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
			const groupNum =
				tagsStr && tagsStr.includes('1') ? 1 : tagsStr && tagsStr.includes('3') ? 3 : 2;

			verbItems.push({
				id: dictionary.trim() + '_' + Math.random().toString(36).substr(2, 4),
				dictionary: dictionary.trim(),
				reading: kana.trim(),
				english: meaning.trim(),
				group: groupNum,
				forms: {
					masu: {
						formName: 'Masu (Polite Non-Past)',
						kanji: baseKanjiForm(dictionary, 'masu'),
						kana: baseKanaForm(kana, 'masu'),
						romaji: (romaji || '') + 'masu',
						english: 'eat / will ' + meaning.trim()
					},
					masen: {
						formName: 'Masen (Polite Negative)',
						kanji: baseKanjiForm(dictionary, 'masen'),
						kana: baseKanaForm(kana, 'masen'),
						romaji: (romaji || '') + 'masen',
						english: 'do not ' + meaning.trim()
					},
					mashita: {
						formName: 'Mashita (Polite Past)',
						kanji: baseKanjiForm(dictionary, 'mashita'),
						kana: baseKanaForm(kana, 'mashita'),
						romaji: (romaji || '') + 'mashita',
						english: 'did ' + meaning.trim()
					},
					te: {
						formName: 'Te-Form (Connection)',
						kanji: baseKanjiForm(dictionary, 'te'),
						kana: baseKanaForm(kana, 'te'),
						romaji: (romaji || '') + 'te',
						english: meaning.trim() + ' and...'
					},
					potential: {
						formName: 'Potential Form',
						kanji: baseKanjiForm(dictionary, 'potential', groupNum),
						kana: baseKanaForm(kana, 'potential', groupNum),
						romaji: (romaji || '') + 'reru',
						english: 'can ' + meaning.trim()
					},
					volitional: {
						formName: 'Volitional Form',
						kanji: baseKanjiForm(dictionary, 'volitional', groupNum),
						kana: baseKanaForm(kana, 'volitional', groupNum),
						romaji: (romaji || '') + 'you',
						english: "let's " + meaning.trim()
					},
					imperative: {
						formName: 'Imperative Form',
						kanji: baseKanjiForm(dictionary, 'imperative', groupNum),
						kana: baseKanaForm(kana, 'imperative', groupNum),
						romaji: (romaji || '') + 'ro',
						english: 'do ' + meaning.trim() + '!'
					}
				}
			});
		}
	}

	return verbItems;
}

function baseKanjiForm(dict: string, form: string, group = 2): string {
	const stem = dict.slice(0, -1);
	if (form === 'masu') return stem + (group === 1 ? 'きます' : 'ます');
	if (form === 'masen') return stem + (group === 1 ? 'きません' : 'ません');
	if (form === 'mashita') return stem + (group === 1 ? 'きましいた' : 'ました');
	if (form === 'te') return stem + (group === 1 ? 'いて' : 'て');
	if (form === 'potential') return group === 1 ? stem + 'ける' : stem + 'られる';
	if (form === 'volitional') return group === 1 ? stem + 'こう' : stem + 'よう';
	if (form === 'imperative') return group === 1 ? stem + 'け' : stem + 'ろ';
	return dict;
}

function baseKanaForm(kana: string, form: string, group = 2): string {
	return baseKanjiForm(kana, form, group); // Simplified helper mapping for kana
}
