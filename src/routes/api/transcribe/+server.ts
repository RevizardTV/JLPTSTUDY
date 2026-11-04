import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Forward the incoming request directly to FastAPI to preserve multipart boundaries
		const pythonRes = await fetch('http://127.0.0.1:8000/transcribe', {
			method: 'POST',
			headers: {
				// Forward content-type header (including the multipart boundary)
				'Content-Type': request.headers.get('content-type') || ''
			},
			body: request.body,
			duplex: 'half' // Required for streaming request bodies in server runtimes
		} as RequestInit);

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

		// Return standard JSON response directly on failure
		return Response.json({ error: errorMessage }, { status: 500 });
	}
};
