<script lang="ts">
	import type { ListeningQuestionItem } from '#lib/types/listening.ts';
	import { transcribeAllItems } from '#lib/utils/transcribeHelper.ts';
	import { questionSets } from '#lib/stores.ts';

	let {
		isOpen = $bindable(false),
		onClose = () => {}
	}: {
		isOpen: boolean;
		onClose?: () => void;
	} = $props();

	let packTitle = $state<string>('');
	let setName = $state<string>('');
	let quizMode = $state<'MatchMode' | 'LockMode'>('MatchMode');

	let audioItems = $state<ListeningQuestionItem[]>([]);
	let pdfUrls = $state<{ id: string; url: string; name: string }[]>([]);

	// Bulk textarea input state
	let bulkQuestionsInput = $state<string>('');

	let currentAudioIndex = $state<number>(0);
	let currentPdfIndex = $state<number>(0);
	let isBatchProcessing = $state<boolean>(false);
	let transcriptionStatus = $state<string>('');

	function handleFilesSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (!files) return;

		for (const file of files) {
			if (file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
				audioItems.push({
					id: crypto.randomUUID(),
					file,
					name: file.name,
					kanji: '',
					kana: '',
					english: '',
					loading: false,
					error: null,
					url: URL.createObjectURL(file)
				});
			} else if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
				pdfUrls.push({
					id: crypto.randomUUID(),
					url: URL.createObjectURL(file),
					name: file.name
				});
			}
		}
		target.value = '';
	}

	function removeAudio(id: string) {
		audioItems = audioItems.filter((item) => item.id !== id);
		if (currentAudioIndex >= audioItems.length) {
			currentAudioIndex = Math.max(0, audioItems.length - 1);
		}
	}

	function removePdf(id: string) {
		pdfUrls = pdfUrls.filter((pdf) => pdf.id !== id);
		if (currentPdfIndex >= pdfUrls.length) {
			currentPdfIndex = Math.max(0, pdfUrls.length - 1);
		}
	}

	async function handleBatchTranscribe() {
		if (audioItems.length === 0) return;
		isBatchProcessing = true;
		transcriptionStatus = `Transcribing ${audioItems.length} audio track(s)...`;

		try {
			await transcribeAllItems(audioItems);
			const transcribedCount = audioItems.filter((item) => item.kanji || item.english).length;
			transcriptionStatus = `Successfully transcribed ${transcribedCount} of ${audioItems.length} tracks!`;
		} catch {
			transcriptionStatus = 'Transcription completed with some errors.';
		} finally {
			isBatchProcessing = false;
		}
	}

	/**
	 * Parses bulk text matching: QuestionName[OAN], QuestionName[OAN]
	 * Example: What is this?[2], Where is the station?[1]
	 */
	function parseBulkQuestions(rawText: string) {
		if (!rawText.trim()) {
			return [
				{
					qNum: 1,
					prompt: 'Empty',
					contextIdx: 0,
					options: [
						{ text: 'Option 1', kana: 'Option 1', english: '1' },
						{ text: 'Option 2', kana: 'Option 2', english: '2' },
						{ text: 'Option 3', kana: 'Option 3', english: '3' },
						{ text: 'Option 4', kana: 'Option 4', english: '4' }
					],
					answer: 0,
					kanji: 'Empty',
					reading: '1'
				}
			];
		}

		// Regex matching pattern text followed by [optionNo] separated by commas or newlines
		// Handles formats like: Question[2], Question[3]
		const regex = /([\s\S]*?)\[(\d+)\]/g;
		let match;
		let parsedList = [];
		let index = 0;

		while ((match = regex.exec(rawText)) !== null) {
			index++;
			const promptText = match[1].trim().replace(/^,\s*/, '');
			const optionNum = parseInt(match[2], 10);
			const correctIndex = Math.max(0, Math.min(3, (isNaN(optionNum) ? 1 : optionNum) - 1));

			parsedList.push({
				qNum: index,
				prompt: promptText || `Question ${index}`,
				contextIdx: 0,
				options: [
					{ text: 'Option 1', kana: 'Option 1', english: '1' },
					{ text: 'Option 2', kana: 'Option 2', english: '2' },
					{ text: 'Option 3', kana: 'Option 3', english: '3' },
					{ text: 'Option 4', kana: 'Option 4', english: '4' }
				],
				answer: correctIndex,
				kanji: promptText || `Question ${index}`,
				reading: String(correctIndex + 1)
			});
		}

		// Fallback if no bracket pattern found but text exists
		if (parsedList.length === 0 && rawText.trim()) {
			parsedList.push({
				qNum: 1,
				prompt: rawText.trim(),
				contextIdx: 0,
				options: [
					{ text: 'Option 1', kana: 'Option 1', english: '1' },
					{ text: 'Option 2', kana: 'Option 2', english: '2' },
					{ text: 'Option 3', kana: 'Option 3', english: '3' },
					{ text: 'Option 4', kana: 'Option 4', english: '4' }
				],
				answer: 0,
				kanji: rawText.trim(),
				reading: '1'
			});
		}

		return parsedList;
	}

	function handleSaveSet() {
		// Check if any audio tracks are untranscribed
		const untranscribed = audioItems.filter((item) => !item.kanji && !item.english);
		if (untranscribed.length > 0) {
			const proceed = confirm(
				`You have ${untranscribed.length} untranscribed audio track(s). Do you still want to save without full transcription?`
			);
			if (!proceed) return;
		}

		const finalTitle =
			packTitle.trim() && setName.trim()
				? `${packTitle.trim()} - ${setName.trim()}`
				: packTitle.trim() || setName.trim() || 'Untitled Listening Practice';

		const questionsArray = parseBulkQuestions(bulkQuestionsInput);

		const newListeningSet = {
			id: `listening-${Date.now()}`,
			title: finalTitle,
			packTitle: packTitle.trim() || 'General',
			category: 'listening',
			listeningMode: quizMode,
			contextPassages: pdfUrls.map((p) => p.name),
			questions: questionsArray,
			vocab: [],
			pdfFiles: pdfUrls.map((p) => ({ url: p.url, name: p.name })),
			audioItems: audioItems,
			createdAt: new Date()
		};

		questionSets.update((sets) => [newListeningSet, ...sets]);

		isOpen = false;
		packTitle = '';
		setName = '';
		audioItems = [];
		pdfUrls = [];
		bulkQuestionsInput = '';
		transcriptionStatus = '';
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
	>
		<div
			class="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]"
		>
			<div
				class="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 gap-3"
			>
				<div class="flex items-center gap-3 w-full">
					<input
						type="text"
						bind:value={packTitle}
						placeholder="Pack Title..."
						class="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs px-3 py-2 outline-none"
					/>
					<input
						type="text"
						bind:value={setName}
						placeholder="Set Name..."
						class="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs px-3 py-2 outline-none"
					/>
					<select
						bind:value={quizMode}
						class="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs px-3 py-2 outline-none cursor-pointer"
					>
						<option value="MatchMode">MatchMode (Instant Transcript Reveal)</option>
						<option value="LockMode">LockMode (Reveal at Quiz End)</option>
					</select>
				</div>
				<button
					onclick={() => (isOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button
				>
			</div>

			<div class="p-6 overflow-y-auto flex-1 space-y-6">
				<!-- File Upload Section -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div
						class="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
					>
						<h3
							class="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300"
						>
							PDF Booklets ({pdfUrls.length})
						</h3>
						<label
							class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer inline-block"
						>
							+ Add PDFs
							<input
								type="file"
								multiple
								accept="application/pdf"
								onchange={handleFilesSelected}
								class="hidden"
							/>
						</label>
						<ul class="text-xs text-slate-500 space-y-1">
							{#each pdfUrls as pdf (pdf.id)}
								<li
									class="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
								>
									<span class="truncate">{pdf.name}</span>
									<button
										onclick={() => removePdf(pdf.id)}
										class="text-rose-500 font-bold cursor-pointer">✕</button
									>
								</li>
							{/each}
						</ul>
					</div>

					<div
						class="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
					>
						<div class="flex justify-between items-center">
							<h3
								class="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Audio Tracks ({audioItems.length})
							</h3>
							{#if audioItems.length > 0}
								<button
									onclick={handleBatchTranscribe}
									disabled={isBatchProcessing}
									class="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer disabled:opacity-50"
								>
									{isBatchProcessing ? 'Transcribing...' : 'Transcribe All'}
								</button>
							{/if}
						</div>

						{#if transcriptionStatus}
							<div
								class="text-xs font-semibold px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20"
							>
								{transcriptionStatus}
							</div>
						{/if}

						<label
							class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer inline-block"
						>
							+ Add Audio
							<input
								type="file"
								multiple
								accept="audio/*"
								onchange={handleFilesSelected}
								class="hidden"
							/>
						</label>
						<ul class="text-xs text-slate-500 space-y-1">
							{#each audioItems as audio (audio.id)}
								<li
									class="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
								>
									<div class="flex items-center gap-2 truncate">
										<span class="truncate">{audio.name}</span>
										{#if audio.kanji || audio.english}
											<span
												class="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold"
												>Transcribed</span
											>
										{/if}
									</div>
									<button
										onclick={() => removeAudio(audio.id)}
										class="text-rose-500 font-bold cursor-pointer">✕</button
									>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Bulk Questions Textarea Section -->
				<div
					class="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
				>
					<div>
						<h3
							class="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
						>
							Bulk Questions Input
						</h3>
						<p class="text-[11px] text-slate-400">
							Format: <code class="text-brand-500 font-bold"
								>QuestionName[OptionNo], QuestionName[OptionNo]</code
							>
						</p>
					</div>

					<textarea
						rows="4"
						bind:value={bulkQuestionsInput}
						placeholder="What is the speaker buying?[2], Where is the train going?[4]"
						class="w-full bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500 font-mono leading-relaxed resize-y"
					></textarea>
				</div>
			</div>

			<div
				class="flex justify-end items-center px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 gap-3"
			>
				<button
					onclick={() => (isOpen = false)}
					class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
					>Cancel</button
				>
				<button
					onclick={handleSaveSet}
					class="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
					>Save Listening Set</button
				>
			</div>
		</div>
	</div>
{/if}
