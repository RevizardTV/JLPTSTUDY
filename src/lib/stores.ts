import { writable } from 'svelte/store';
import type { QuestionSet, UserProgressData } from '#lib/types.js';
import { SvelteSet } from 'svelte/reactivity';

export const initialData: QuestionSet[] = [
  {
    id: "ex1",
    title: "EX-1",
    category: "kanji",
    contextPassages: [
      "しけんは来月の七月八日、木よう日、九時からです。",
      "ふうとうにお金が八万円入っていました。",
      "きょうは天気がいいです。がっこうの5かいのまどから、北に白い山がよく見えます。"
    ],
    questions: [
      { 
        qNum: 1, 
        prompt: "来月", 
        contextIdx: 0, 
        options: [
          { text: "くげつ", kana: "くげつ", english: "nine months" },
          { text: "らいがつ", kana: "らいがつ", english: "incorrect reading" },
          { text: "くがつ", kana: "くがつ", english: "September" },
          { text: "らいげつ", kana: "らいげつ", english: "next month" }
        ], 
        answer: 3, 
        kanji: "来月", 
        reading: "らいげつ" 
      }
    ],
    vocab: [
      { word: "試験 (shiken)", meaning: "examination, test" },
      { word: "来月 (raigetsu)", meaning: "next month" }
    ]
  }
];

const defaultProgress: UserProgressData = {
  completedSets: {},
  weakQuestions: [],
  customPackages: [],
  totalQuizzes: 0
};

// Unified progress key: 'kanji_question_progress'
const savedProgress = typeof window !== 'undefined' ? localStorage.getItem('kanji_question_progress') : null;
export const userProgress = writable<UserProgressData>(savedProgress ? JSON.parse(savedProgress) : defaultProgress);

userProgress.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanji_question_progress', JSON.stringify(value));
  }
});

// Load sets using the unified 'kanji_question_sets' key
const savedSets = typeof window !== 'undefined' ? localStorage.getItem('kanji_question_sets') : null;
const rawSets: QuestionSet[] = savedSets ? JSON.parse(savedSets) : initialData;

// Runtime safety pass to guarantee unique IDs and prevent each_key_duplicate crashes
const seenIds = new SvelteSet<string>();
const sanitizedSets = rawSets.map((set, index) => {
  let id = set.id || `set-${index}`;
  if (seenIds.has(id)) {
    id = `${id}-${index}-${Date.now()}`;
  }
  seenIds.add(id);
  return { ...set, id };
});

export const questionSets = writable<QuestionSet[]>(sanitizedSets);

questionSets.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanji_question_sets', JSON.stringify(value));
  }
});

/**
 * Deletes a question set by ID and automatically removes its corresponding 
 * completed stats entry from user progress to keep analytics clean.
 */
export function deleteQuestionSet(setId: string) {
  questionSets.update((sets) => sets.filter((s) => s.id !== setId));
  
  userProgress.update((prog) => {
    const updatedCompleted = { ...prog.completedSets };
    delete updatedCompleted[setId];
    return {
      ...prog,
      completedSets: updatedCompleted
    };
  });
}