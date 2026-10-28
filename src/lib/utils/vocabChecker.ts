import type { QuestionSet, VocabItem } from '#lib/types.js';
import { SvelteSet } from 'svelte/reactivity';

export function normalizeVocabText(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '');
}

/**
 * Scans all existing question sets and builds a set of registered kana/words.
 */
export function getExistingVocabSignatures(sets: QuestionSet[]): SvelteSet<string> {
  const existingSet = new SvelteSet<string>();
  
  sets.forEach((set) => {
    set.vocab?.forEach((v: VocabItem | string) => {
      if (typeof v === 'object' && v !== null) {
        if (v.kana) existingSet.add(normalizeVocabText(v.kana));
        if (v.word) existingSet.add(normalizeVocabText(v.word));
        const match = v.word.match(/\(([^)]+)\)/);
        if (match) existingSet.add(normalizeVocabText(match[1]));
      } else if (typeof v === 'string') {
        existingSet.add(normalizeVocabText(v));
        const match = v.match(/\(([^)]+)\)/);
        if (match) existingSet.add(normalizeVocabText(match[1]));
      }
    });
  });

  return existingSet;
}

/**
 * Filters an incoming array of VocabItems against a reference signature set,
 * tracking how many duplicates were skipped.
 */
export function filterUniqueVocab(
  incomingVocab: VocabItem[],
  existingSignatures: SvelteSet<string>
): { uniqueVocab: VocabItem[]; skippedCount: number } {
  let skippedCount = 0;
  const uniqueVocab: VocabItem[] = [];

  incomingVocab.forEach((v) => {
    const itemKana = v.kana ? normalizeVocabText(v.kana) : '';
    const itemWord = v.word ? normalizeVocabText(v.word) : '';

    const isDuplicate =
      (itemKana && existingSignatures.has(itemKana)) ||
      (itemWord && existingSignatures.has(itemWord));

    if (isDuplicate) {
      skippedCount++;
    } else {
      if (itemKana) existingSignatures.add(itemKana);
      if (itemWord) existingSignatures.add(itemWord);
      uniqueVocab.push(v);
    }
  });

  return { uniqueVocab, skippedCount };
}