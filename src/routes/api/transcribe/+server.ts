import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const audioFile = formData.get('file');

		if (!audioFile) {
			return json({ error: 'No audio file provided' }, { status: 400 });
		}

		// Forward the audio file to your Python FastAPI Whisper backend
		const pythonRes = await fetch('http://127.0.0.1:8000/transcribe', {
			method: 'POST',
			body: formData
		});

		if (!pythonRes.ok) {
			const errText = await pythonRes.text();
			throw new Error(`Python transcription service failed: ${errText}`);
		}

		const data = await pythonRes.json();
		return json(data);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);

		// Log full error internally for terminal debugging
		console.error('Transcription API Error:', errorMessage);

		// Pass a valid string or object matching SvelteKit's expected Error interface
		throw error(500, errorMessage);
	}
};
