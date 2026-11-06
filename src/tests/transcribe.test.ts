import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

describe('Python Whisper Microservice & SvelteKit API Integration', () => {
	it('should successfully connect to the FastAPI Whisper server health or root', async () => {
		const res = await fetch('http://127.0.0.1:8000/docs');
		expect(res.ok).toBe(true);
	});

	it(
		'should successfully transcribe a real MP3 audio file via the SvelteKit API',
		async () => {
			// 1. Read the real MP3 file from your test fixtures directory
			const filePath = path.resolve('src/tests/fixtures/sample.mp3');
			const fileBuffer = fs.readFileSync(filePath);

			// 2. Wrap it into a Blob / File object
			const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
			const formData = new FormData();
			formData.append('file', blob, 'sample.mp3');

			// 3. Send it to your SvelteKit API route
			const res = await fetch('http://localhost:5173/api/transcribe', {
				method: 'POST',
				body: formData
			});

			const contentType = res.headers.get('content-type') || '';
			expect(contentType).toContain('application/json');

			const data = await res.json();
			console.log('API Transcription Response:', data);

			expect(res.ok).toBe(true);
			expect(data).toHaveProperty('kanji');
			expect(data).toHaveProperty('kana');
			expect(data).toHaveProperty('english');
		},
		{ timeout: 30000 }
	);
});
