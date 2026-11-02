export type VerbGroup = 1 | 2 | 3; // Group I (U-verbs), Group II (Ru-verbs), Group III (Irregular)
export type AdjCategory = 'i-adj' | 'na-adj';

export interface FormExample {
	formName: string; // e.g., "Te-Form (Request / Connection)"
	kanji: string; // e.g., "食べてください"
	kana: string; // e.g., "たべてください"
	romaji: string; // e.g., "tabete kudasai"
	english: string; // e.g., "Please eat"
	usageNote?: string; // e.g., "Used for polite requests"
}

export interface VerbItem {
	id: string;
	dictionary: string; // 食べる
	reading: string; // たべる
	english: string; // to eat
	group: VerbGroup;
	forms: Record<string, FormExample>;
}

export interface AdjItem {
	id: string;
	dictionary: string; // 高い or 親切[な]
	reading: string; // たかい or しんせつ
	english: string; // expensive / kind
	category: AdjCategory;
	forms: Record<string, FormExample>;
}
