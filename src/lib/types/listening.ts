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

export interface QuestionListeningSet extends QuestionSet {
	pdfFiles: { id?: string; url: string; name: string }[];
	audioItems: ListeningQuestionItem[];
	listeningMode?: 'MatchMode' | 'LockMode';
}
