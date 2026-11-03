export interface ListeningQuestionItem {
	id: string;
	file: File;
	name: string;
	kanji: string;
	kana: string;
	english: string;
	loading: boolean;
	error: string | null;
}

export interface QuestionListeningSet {
	setId: string;
	setTitle: string;
	pdfFiles: { url: string; name: string }[];
	audioItems: ListeningQuestionItem[];
	createdAt: Date;
}

/**
 * Helper to initialize a new listening set structure
 */
export function createListeningSet(title: string): QuestionListeningSet {
	return {
		setId: crypto.randomUUID(),
		setTitle: title || 'Untitled Listening Practice',
		pdfFiles: [],
		audioItems: [],
		createdAt: new Date()
	};
}
