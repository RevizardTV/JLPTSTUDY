import type { QuestionSet } from '#lib/types.js';

export interface ListeningQuestionItem {
	id: string;
	file: File;
	name: string;
	kanji: string;
	kana: string;
	english: string;
	loading: boolean;
	error: string | null;
	url?: string;
}

export interface ListeningQuestionOption {
	text: string;
	kana: string;
	english: string;
}

export interface ListeningQuestionDetail {
	qNum: number;
	prompt: string;
	contextIdx: number;
	options: ListeningQuestionOption[];
	answer: number;
	kanji: string;
	reading: string;
}

// Extend QuestionSet so TypeScript recognizes listening-specific properties
export interface QuestionListeningSet extends QuestionSet {
	pdfFiles: { id?: string; url: string; name: string }[];
	audioItems: (ListeningQuestionItem & { customPrompt?: string; correctOptionIndex?: number })[];
}
