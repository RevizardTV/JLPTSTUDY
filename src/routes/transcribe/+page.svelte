<script lang="ts">
	let audioFile = $state<File | null>(null);
	let audioFileName = $state<string>('');
	let audioUrl = $state<string>('');
	let transcriptText = $state<string>('');
	let isTranscribing = $state(false);
	let errorMessage = $state<string | null>(null);

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			audioFile = file;
			audioFileName = file.name;
			audioUrl = URL.createObjectURL(file);
			transcriptText = '';
			errorMessage = null;
		}
	}

	async function handleTranscribe() {
		if (!audioFile) return;

		isTranscribing = true;
		errorMessage = null;
		const formData = new FormData();
		formData.append('file', audioFile);

		try {
			const res = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Transcription failed on server');
			}

			transcriptText = data.text;
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
			isTranscribing = false;
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(transcriptText);
		alert('Transcript copied to clipboard!');
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
	<!-- Hero Header -->
	<div
		class="bg-linear-to-r from-brand-600 to-indigo-600 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-2"
	>
		<span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold"
			>AI Speech-to-Text Pipeline</span
		>
		<h2 class="text-2xl sm:text-3xl font-extrabold">Japanese Audio Transcriber</h2>
		<p class="text-indigo-100 text-sm">
			Upload Japanese listening tracks to automatically generate Kanji & Kana text via self-hosted
			Whisper.
		</p>
	</div>

	<!-- Main Workspace Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Upload & Preview Panel -->
		<div
			class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
		>
			<h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
				<span>🎵</span>
				<span>Audio Source</span>
			</h3>

			<div
				class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3 hover:border-brand-500 transition"
			>
				<div class="text-3xl">📁</div>
				<div class="text-xs text-slate-500 dark:text-slate-400">
					{#if audioFileName}
						<span class="font-bold text-emerald-500">{audioFileName}</span>
					{:else}
						Drop your Japanese audio file here or browse
					{/if}
				</div>
				<label
					class="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition"
				>
					Select Audio File
					<input type="file" accept="audio/*" onchange={handleFileSelect} class="hidden" />
				</label>
			</div>

			{#if audioUrl}
				<audio controls class="w-full pt-2">
					<source src={audioUrl} />
					Your browser does not support the audio element.
				</audio>
			{/if}

			<button
				onclick={handleTranscribe}
				disabled={!audioFile || isTranscribing}
				class="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
			>
				{#if isTranscribing}
					<span class="animate-spin">⏳</span>
					<span>Transcribing Japanese Audio...</span>
				{:else}
					<span>✨</span>
					<span>Run Whisper Transcription</span>
				{/if}
			</button>

			{#if errorMessage}
				<div
					class="p-3 bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-xl border border-rose-500/20"
				>
					{errorMessage}
				</div>
			{/if}
		</div>

		<!-- Transcript Output Panel -->
		<div
			class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col space-y-4"
		>
			<div
				class="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3"
			>
				<h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
					<span>📝</span>
					<span>Generated Japanese Transcript</span>
				</h3>
				{#if transcriptText}
					<button
						onclick={copyToClipboard}
						class="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition"
					>
						Copy Text
					</button>
				{/if}
			</div>

			<div class="flex-1 min-h-62.5">
				<textarea
					bind:value={transcriptText}
					placeholder="Transcription output in Kanji & Kana will appear here..."
					class="w-full h-full min-h-62.5 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-japanese text-sm text-slate-800 dark:text-slate-200 outline-none resize-none"
				></textarea>
			</div>
		</div>
	</div>
</div>
