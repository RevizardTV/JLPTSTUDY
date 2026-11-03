import { describe, it, expect } from 'bun:test';

describe('Python Whisper Microservice & SvelteKit API Integration', () => {
	it('should successfully connect to the FastAPI Whisper server health or root', async () => {
		try {
			const res = await fetch('http://127.0.0.1:8000/docs');
			expect(res.status).toBe(200);
		} catch (err) {
			// 'err' is now used and passed as the error cause
			throw new Error(
				'FastAPI Python server is not running on port 8000. Make sure your batch script is running!',
				{ cause: err }
			);
		}
	});

	it('should return JSON (not HTML doctype) when sending an audio payload to the SvelteKit API', async () => {
		try {
			// Create a dummy mini audio blob/file payload for testing
			const dummyAudioContent = new Uint8Array([255, 243, 164, 96, 0, 0, 0, 0]); // Mock bytes
			const formData = new FormData();
			formData.append('file', new Blob([dummyAudioContent], { type: 'audio/mp3' }), 'test.mp3');

			// Test your SvelteKit API endpoint proxy
			const res = await fetch('http://localhost:5173/api/transcribe', {
				method: 'POST',
				body: formData
			});

			const contentType = res.headers.get('content-type') || '';

			// If the server crashes, SvelteKit returns text/html (the error page). We want application/json.
			if (contentType.includes('text/html')) {
				const htmlText = await res.text();
				console.error(
					'SvelteKit returned an HTML error page instead of JSON:',
					htmlText.slice(0, 200)
				);
			}

			expect(contentType).toContain('application/json');

			const data = await res.json();
			console.log('API Response received:', data);
		} catch (err) {
			throw new Error('Failed to complete SvelteKit transcription API test request', {
				cause: err
			});
		}
	});
});
