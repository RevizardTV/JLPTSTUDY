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
  // Added optional fields so QuizScreen can map them without type errors
  setId?: string;
  setTitle?: string;
  contextText?: string;
}

export interface VocabItem {
  word: string;
  meaning: string;
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

export interface SetStats {
  bestScore: number;
  completedAt?: string;
}

export interface UserProgressData {
  completedSets: Record<string, SetStats | boolean>;
  weakQuestions: number[];
  customPackages: string[];
  totalQuizzes: number;
}

// Added Quiz & Progress Event Types
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