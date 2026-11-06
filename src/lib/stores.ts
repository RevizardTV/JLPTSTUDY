import { writable } from 'svelte/store';
import type { QuestionSet, UserProgressData, FinishEventData, SetProgress, UserAnswer } from '#lib/types.js';
import type { VerbItem, AdjItem } from '#lib/types/grammar.js';
import { SvelteSet } from 'svelte/reactivity';

// ==========================================
// 1. QUESTION SETS & QUIZ PROGRESS STORES
// ==========================================

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

const savedProgress = typeof window !== 'undefined' ? localStorage.getItem('kanji_question_progress') : null;
export const userProgress = writable<UserProgressData>(savedProgress ? JSON.parse(savedProgress) : defaultProgress);

userProgress.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanji_question_progress', JSON.stringify(value));
  }
});

const savedSets = typeof window !== 'undefined' ? localStorage.getItem('kanji_question_sets') : null;
const rawSets: QuestionSet[] = savedSets ? JSON.parse(savedSets) : initialData;

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

// ==========================================
// 2. VERB GRAMMAR STORE
// ==========================================

export const initialVerbs: VerbItem[] = [
  {
    id: 'taberu',
    group: 2,
    dictionary: '食べる',
    reading: 'たべる',
    english: 'to eat',
    forms: {
      masu: { formName: 'Masu (Polite Non-Past)', kanji: '食べます', kana: 'たべます', romaji: 'tabemasu', english: 'eat / will eat' },
      masen: { formName: 'Masen (Polite Negative)', kanji: '食べません', kana: 'たべません', romaji: 'tabemasen', english: 'do not eat' },
      mashita: { formName: 'Mashita (Polite Past)', kanji: '食べました', kana: 'たべました', romaji: 'tabemashita', english: 'ate' },
      masenka: { formName: 'Masen ka (Polite Invitation)', kanji: '食べませんか', kana: 'たべませんか', romaji: 'tabemasen ka', english: "won't you eat?" },
      te: { formName: 'Te-Form (Connection)', kanji: '食べて', kana: 'たべて', romaji: 'tabete', english: 'eat and...' },
      tai: { formName: 'Tai-Form (Desire)', kanji: '食べたいです', kana: 'たべたいです', romaji: 'tabetai desu', english: 'want to eat' },
      potential: { formName: 'Potential Form', kanji: '食べられる', kana: 'たべられる', romaji: 'taberareru', english: 'can eat' },
      volitional: { formName: 'Volitional Form', kanji: '食べよう', kana: 'たべよう', romaji: 'tabeyou', english: "let's eat" }
    }
  }
];

const savedVerbs = typeof window !== 'undefined' ? localStorage.getItem('jlpt_verb_list') : null;
export const verbStore = writable<VerbItem[]>(savedVerbs ? JSON.parse(savedVerbs) : initialVerbs);

verbStore.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jlpt_verb_list', JSON.stringify(value));
  }
});

// ==========================================
// 3. ADJECTIVE GRAMMAR STORE
// ==========================================

export const initialAdjectives: AdjItem[] = [
  {
    id: 'ookii',
    category: 'i-adj',
    dictionary: '大きい',
    reading: 'おおきい',
    english: 'big',
    forms: {
      nonPast: { formName: 'Non-Past Polite', kanji: '大きいです', kana: 'おおきいです', romaji: 'ookii desu', english: 'is big' },
      past: { formName: 'Past Polite', kanji: '大きかったです', kana: 'おおきかったです', romaji: 'ookikatta desu', english: 'was big' },
      negative: { formName: 'Negative Polite', kanji: '大きくないです', kana: 'おおきくないです', romaji: 'ookikunai desu', english: 'is not big' },
      pastNegative: { formName: 'Past Negative Polite', kanji: '大きくなかったです', kana: 'おおきくなかったです', romaji: 'ookikunakatta desu', english: 'was not big' },
      adverbial: { formName: 'Adverbial Form (ku-form)', kanji: '大きく', kana: 'おおきく', romaji: 'ookiku', english: 'big (adverb)' },
      attributive: { formName: 'Attributive Form', kanji: '大きい', kana: 'おおきい', romaji: 'ookii', english: 'big (base form)' }
    }
  }
];

const savedAdjectives = typeof window !== 'undefined' ? localStorage.getItem('jlpt_adjective_list') : null;
export const adjectiveStore = writable<AdjItem[]>(savedAdjectives ? JSON.parse(savedAdjectives) : initialAdjectives);

adjectiveStore.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jlpt_adjective_list', JSON.stringify(value));
  }
});

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

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