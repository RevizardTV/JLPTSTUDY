// src/lib/types.ts
export type CategoryType = 'kanji' | 'grammar' | 'reading' | 'vocabulary' | 'listening' | string;

export interface ListeningAssets {
	audioUrl?: string;
	pdfUrl?: string;
	pdfFileName?: string;
	audioFileName?: string;
}
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

export interface FormExample {
	formName: string;
	kanji: string;
	kana: string;
	romaji: string;
	english: string;
	usageNote?: string;
}

export interface VerbItem {
	id: string;
	dictionary: string;
	reading: string;
	english: string;
	group: 1 | 2 | 3;
	forms: Record<string, FormExample>;
}

export interface AdjItem {
	id: string;
	dictionary: string;
	reading: string;
	english: string;
	category: 'i-adj' | 'na-adj';
	forms: Record<string, FormExample>;
}

export interface QuestionSet {
	id: string;
	title: string;
	category: CategoryType;
	tags?: string[];
	packTitle?: string;
	contextPassages: string[];
	contextEnglish?: string[];
	questions: Question[];
	vocab?: VocabItem[];
	verbs?: VerbItem[]; // Added to support verb extraction from text files
	adjectives?: AdjItem[]; // Added to support adjective extraction from text files
	listeningAssets?: ListeningAssets;
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
	userAnswers?: UserAnswer[];
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
