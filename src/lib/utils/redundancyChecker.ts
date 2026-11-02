// src/lib/utils/redundancyChecker.ts
import type { VerbItem, AdjItem } from '#lib/types/grammar.js';

/**
 * Filters out incoming verbs that already exist based on their dictionary form.
 */
export function filterRedundantVerbs(
	existingVerbs: VerbItem[],
	newVerbs: VerbItem[]
): { uniqueItems: VerbItem[]; skippedCount: number } {
	const existingKanji = new Set(existingVerbs.map((v) => v.dictionary.trim()));
	const uniqueItems = newVerbs.filter((item) => !existingKanji.has(item.dictionary.trim()));
	const skippedCount = newVerbs.length - uniqueItems.length;

	return { uniqueItems, skippedCount };
}

/**
 * Filters out incoming adjectives that already exist based on their dictionary form.
 */
export function filterRedundantAdjectives(
	existingAdjs: AdjItem[],
	newAdjs: AdjItem[]
): { uniqueItems: AdjItem[]; skippedCount: number } {
	const existingKanji = new Set(existingAdjs.map((a) => a.dictionary.trim()));
	const uniqueItems = newAdjs.filter((item) => !existingKanji.has(item.dictionary.trim()));
	const skippedCount = newAdjs.length - uniqueItems.length;

	return { uniqueItems, skippedCount };
}
