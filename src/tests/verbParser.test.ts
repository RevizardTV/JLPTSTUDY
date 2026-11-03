// src/lib/utils/verbTextParser.test.ts
import { describe, expect, test } from 'bun:test';
import { parseVerbTextToItems } from '#lib/utils/verbTextParser.ts';

describe('Verb Text Parser', () => {
	test('correctly parses standard and irregular verbs', () => {
		const rawInput = `
			食べる (たべる) [taberu] - to eat (group2, n5)
			する (する) [suru] - to do (group3, n5)
		`;

		const result = parseVerbTextToItems(rawInput);

		expect(result.length).toBe(2);

		// Check regular Group 2 verb
		expect(result[0].dictionary).toBe('食べる');
		expect(result[0].group).toBe(2);
		expect(result[0].forms.masu.kanji).toBe('食べます');

		// Check irregular Group 3 verb (suru exception)
		expect(result[1].dictionary).toBe('する');
		expect(result[1].forms.masu.kanji).toBe('します');
		expect(result[1].forms.te.kanji).toBe('して');
	});
});
