import { writable } from 'svelte/store';
import type { QuestionSet, UserProgressData } from '#lib/types.js';

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

const savedProgress = typeof window !== 'undefined' ? localStorage.getItem('kanji_quiz_progress') : null;
export const userProgress = writable<UserProgressData>(savedProgress ? JSON.parse(savedProgress) : defaultProgress);

userProgress.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanji_quiz_progress', JSON.stringify(value));
  }
});

const savedSets = typeof window !== 'undefined' ? localStorage.getItem('kanji_quiz_sets') : null;
export const questionSets = writable<QuestionSet[]>(savedSets ? JSON.parse(savedSets) : initialData);

questionSets.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanji_quiz_sets', JSON.stringify(value));
  }
});
