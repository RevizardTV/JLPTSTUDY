import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. Read incoming form data from the client request
		const formData = await request.formData();

		// 2. Re-build a clean FormData payload to send to FastAPI
		const upstreamFormData = new FormData();
		for (const [key, value] of formData.entries()) {
			upstreamFormData.append(key, value);
		}

		// 3. Forward to FastAPI (let fetch handle the multipart boundary automatically)
		const pythonRes = await fetch('http://127.0.0.1:8000/transcribe', {
			method: 'POST',
			body: upstreamFormData
		});

		if (!pythonRes.ok) {
			const errText = await pythonRes.text();
			return Response.json(
				{ error: `Python transcription service failed: ${errText}` },
				{ status: 500 }
			);
		}

		const data = await pythonRes.json();
		return Response.json(data);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		console.error('Transcription API Error:', errorMessage);

		return Response.json({ error: errorMessage }, { status: 500 });
	}
};
