import { writable } from 'svelte/store';
import type { QuestionSet, UserProgressData, FinishEventData, SetProgress, UserAnswer } from '#lib/types.js';
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
 * Records quiz completion statistics.
 */
export function recordQuizCompletion(data: FinishEventData) {
  if (!data.setId) return;

  userProgress.update((prog) => {
    const existing = prog.completedSets[data.setId!] as SetProgress | undefined;
    const accuracy = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
    const bestScore = existing && typeof existing === 'object' ? Math.max(existing.bestScore || 0, data.score) : data.score;
    const attemptedCount = data.userAnswers.length;

    const setProgress: SetProgress = {
      bestScore,
      total: data.total,
      accuracy,
      attemptedCount,
      currentIndex: data.total - 1,
      progressPercentage: 100,
      userAnswers: data.userAnswers,
      completedAt: new Date().toISOString()
    };

    const updated = {
      ...prog,
      totalQuizzes: prog.totalQuizzes + 1,
      completedSets: {
        ...prog.completedSets,
        [data.setId!]: setProgress
      }
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kanji_question_progress', JSON.stringify(updated));
    }

    return updated;
  });
}

/**
 * Deletes a question set by ID and removes progress.
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

/**
 * Updates active index, score, attempted count, and saved user answers.
 */
export function updateSetProgressIndex(
  setId: string, 
  currentIndex: number, 
  total: number, 
  score: number = 0, 
  attempted: number = 0, 
  userAnswers: UserAnswer[] = []
) {
  userProgress.update((prog) => {
    const existing = prog.completedSets[setId] as SetProgress | undefined;
    const progressPercentage = Math.round(((currentIndex + 1) / total) * 100);

    const setProgress: SetProgress = {
      bestScore: Math.max(existing && typeof existing === 'object' ? (existing.bestScore || 0) : 0, score),
      total,
      accuracy: existing && typeof existing === 'object' ? existing.accuracy : 0,
      currentIndex,
      progressPercentage,
      attemptedCount: Math.max(existing && typeof existing === 'object' ? (existing.attemptedCount || 0) : 0, attempted),
      userAnswers,
      completedAt: existing && typeof existing === 'object' ? existing.completedAt : undefined
    };

    const updated = {
      ...prog,
      completedSets: {
        ...prog.completedSets,
        [setId]: setProgress
      }
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kanji_question_progress', JSON.stringify(updated));
    }

    return updated;
  });
}

/**
 * Resets a specific question set's progress back to unattempted.
 */
export function resetSetProgress(setId: string) {
  userProgress.update((prog) => {
    const updatedCompleted = { ...prog.completedSets };
    delete updatedCompleted[setId];

    const updated = {
      ...prog,
      completedSets: updatedCompleted
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kanji_question_progress', JSON.stringify(updated));
    }

    return updated;
  });
}