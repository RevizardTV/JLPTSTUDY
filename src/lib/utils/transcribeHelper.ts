import type { ListeningQuestionItem } from '#lib/types/listening.ts';

/**
 * Transcribes a single listening item and updates its fields directly.
 */
export async function transcribeItem(item: ListeningQuestionItem): Promise<void> {
	item.loading = true;
	item.error = null;

	const formData = new FormData();
	formData.append('file', item.file);

	try {
		const res = await fetch('/api/transcribe', {
			method: 'POST',
			body: formData
		});

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || 'Transcription failed on server');

		item.kanji = data.kanji || data.text || '';
		item.kana = data.kana || '';
		item.english = data.english || '';
	} catch (err: unknown) {
		item.error = err instanceof Error ? err.message : 'An unknown error occurred';
	} finally {
		item.loading = false;
	}
}

/**
 * Helper to mass-transcribe all audio items in a listening set sequentially or concurrently.
 */
export async function transcribeAllItems(items: ListeningQuestionItem[]): Promise<void> {
	// Run sequentially to prevent overwhelming local CPU Whisper processing
	for (const item of items) {
		if (!item.kanji && !item.loading) {
			await transcribeItem(item);
		}
	}
}
