export interface Option {
  text: string;
  kana: string;
  english: string;
}

export interface Question {
  qNum: number;
  prompt: string;
  contextIdx: number;
  options: Option[];
  answer: number;
  kanji?: string;
  reading?: string;
  setId?: string;
  setTitle?: string;
  contextText?: string;
}

export interface VocabItem {
  word: string;
  meaning: string;
  kana?: string;
  romaji?: string;
  vocabTags?: string[];
}

export interface QuestionSet {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  packTitle?: string;
  contextPassages: string[];
  questions: Question[];
  vocab?: VocabItem[];
}

export interface SetProgress {
  bestScore: number;
  total: number;
  accuracy: number;
  completedAt?: string;
}

export interface UserProgressData {
  completedSets: Record<string, SetProgress | boolean>;
  weakQuestions: number[];
  customPackages: string[];
  totalQuizzes: number;
}

export interface QuizConfig {
  mode: 'all' | 'exercise' | string;
  setId?: string;
  practice: boolean;
  timed?: boolean;
  customQuestions?: Question[];
}

export interface UserAnswer {
  question: Question;
  selected: number;
  isCorrect: boolean;
}

export interface FinishEventData {
  score: number;
  total: number;
  userAnswers: UserAnswer[];
  secondsElapsed: number;
  setId?: string;
}