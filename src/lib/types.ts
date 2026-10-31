export type CategoryType = 'kanji' | 'grammar' | 'reading' | 'vocabulary' | string;

export interface Option {
	text: string;
	kana: string;
	english: string;
}

export interface Question {
	qNum: number;
	prompt: string;
	english?: string;
	contextIdx: number;
	options: Option[];
	answer: number;
	kanji?: string;
	reading?: string;
	kanjiReading?: string;
	setId?: string;
	setTitle?: string;
	contextText?: string;
	contextEnglishText?: string;
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
	category: CategoryType;
	tags?: string[];
	packTitle?: string;
	contextPassages: string[];
	contextEnglish?: string[]; // Added to support context translation display
	questions: Question[];
	vocab?: VocabItem[];
}

export interface UserAnswer {
	question: Question;
	selected: number;
	isCorrect: boolean;
}

export interface SetProgress {
	bestScore: number;
	total: number;
	accuracy: number;
	completedAt?: string;
	currentIndex?: number;
	progressPercentage?: number;
	attemptedCount?: number;
	userAnswers?: UserAnswer[]; // Added to fix the property type error
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

export interface FinishEventData {
	score: number;
	total: number;
	userAnswers: UserAnswer[];
	secondsElapsed: number;
	setId?: string;
}
