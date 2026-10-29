import { describe, it, expect } from 'bun:test';
import { parseGrammarTextToSets } from '#lib/utils/textParser.ts';

const SAMPLE_TEXT_PAYLOAD = `
---
SetId: test-n5-sample
Title: JLPT N5 Sample Test
Category: grammar
PackTitle: testing
Tags: n5, test
ContextPassages: 週末の公園での会話です。
ContextEnglish: This is a conversation at the park on the weekend.

1. 白い猫を _______ 見ます。
   1) が - subject
   2) を - object marker
   3) に - in
   4) へ - to
   English: I see a white cat [_____].
   Kanji: 猫
   Reading: ねこ
   KanjiReading: [ねこ]
   ContextIdx: 0

2. あしたは _______ です。
   1) きのう - yesterday
   2) あした - tomorrow
   3) きょう - today
   4) あさって - day after
   English: Tomorrow is [_____].

Answer Key:
1. 2, 2. 2

Vocab:
猫 (ねこ) [neko] - cat (noun, animal, n5)
明日 (あした) [ashita] - tomorrow (noun, time, n5)
`;

describe('grammarTextParser', () => {
	it('should parse metadata headers correctly', () => {
		const sets = parseGrammarTextToSets(SAMPLE_TEXT_PAYLOAD);
		expect(sets.length).toBe(1);

		const set = sets[0];
		expect(set.id).toBe('test-n5-sample');
		expect(set.title).toBe('JLPT N5 Sample Test');
		expect(set.category).toBe('grammar');
		expect(set.contextPassages[0]).toBe('週末の公園での会話です。');
		expect(set.contextEnglish?.[0]).toBe('This is a conversation at the park on the weekend.');
	});

	it('should parse questions and map answer keys correctly', () => {
		const sets = parseGrammarTextToSets(SAMPLE_TEXT_PAYLOAD);
		const questions = sets[0].questions;

		expect(questions.length).toBe(2);

		// Q1 Checks
		expect(questions[0].qNum).toBe(1);
		expect(questions[0].prompt).toBe('白い猫を _______ 見ます。');
		expect(questions[0].options.length).toBe(4);
		expect(questions[0].answer).toBe(1); // Option 2 (0-indexed)
		expect(questions[0].kanjiReading).toBe('[ねこ]');
		expect(questions[0].english).toBe('I see a white cat [_____].');

		// Q2 Checks
		expect(questions[1].qNum).toBe(2);
		expect(questions[1].answer).toBe(1); // Option 2 (0-indexed)
	});

	it('should harvest vocabulary items at the end of the block', () => {
		const sets = parseGrammarTextToSets(SAMPLE_TEXT_PAYLOAD);
		const vocab = sets[0].vocab;

		expect(vocab).toBeDefined();
		expect(vocab?.length).toBe(2);
		expect(vocab?.[0].word).toBe('猫');
		expect(vocab?.[0].kana).toBe('ねこ');
		expect(vocab?.[0].romaji).toBe('neko');
	});

	it('should handle multiple sets separated by ---', () => {
		const multiBlockPayload = `${SAMPLE_TEXT_PAYLOAD}\n---\nSetId: test-n5-set-2\nTitle: Second Set\n\n1. テスト\n   1) a - test\n   2) b - test\n   3) c - test\n   4) d - test\n\nAnswer Key:\n1. 1\n`;
		const sets = parseGrammarTextToSets(multiBlockPayload);

		expect(sets.length).toBe(2);
		expect(sets[1].id).toBe('test-n5-set-2');
	});
});
