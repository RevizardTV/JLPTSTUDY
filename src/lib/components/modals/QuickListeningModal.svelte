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

	let audioItems = $state<ListeningQuestionItem[]>([]);
	let pdfUrls = $state<{ id: string; url: string; name: string }[]>([]);

	// Questions supporting question|OptionNo format
	let customQuestions = $state<{ id: string; rawInput: string }[]>([
		{ id: crypto.randomUUID(), rawInput: '' }
	]);

	let currentAudioIndex = $state<number>(0);
	let currentPdfIndex = $state<number>(0);
	let isBatchProcessing = $state<boolean>(false);

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

	function addQuestion() {
		customQuestions.push({
			id: crypto.randomUUID(),
			rawInput: ''
		});
	}

	function removeQuestion(id: string) {
		customQuestions = customQuestions.filter((q) => q.id !== id);
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
		isBatchProcessing = true;
		await transcribeAllItems(audioItems);
		isBatchProcessing = false;
	}

	function handleSaveSet() {
		const finalTitle =
			packTitle.trim() && setName.trim()
				? `${packTitle.trim()} - ${setName.trim()}`
				: packTitle.trim() || setName.trim() || 'Untitled Listening Practice';

		const newListeningSet = {
			id: `listening-${Date.now()}`,
			title: finalTitle,
			category: 'listening',
			contextPassages: pdfUrls.map((p) => p.name),
			questions: customQuestions.map((q, idx) => {
				const trimmed = q.rawInput.trim();
				// If empty, set prompt as Empty and default answer to 0
				if (!trimmed) {
					return {
						qNum: idx + 1,
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
					};
				}

				// Split by pipe "|" (e.g. Question text|2)
				const parts = trimmed.split('|');
				const promptText = parts[0]?.trim() || `Question ${idx + 1}`;
				const optionNum = parts[1] ? parseInt(parts[1].trim(), 10) : 1;
				const correctIndex = Math.max(0, Math.min(3, (isNaN(optionNum) ? 1 : optionNum) - 1));

				return {
					qNum: idx + 1,
					prompt: promptText,
					contextIdx: 0,
					options: [
						{ text: 'Option 1', kana: 'Option 1', english: '1' },
						{ text: 'Option 2', kana: 'Option 2', english: '2' },
						{ text: 'Option 3', kana: 'Option 3', english: '3' },
						{ text: 'Option 4', kana: 'Option 4', english: '4' }
					],
					answer: correctIndex,
					kanji: promptText,
					reading: String(correctIndex + 1)
				};
			}),
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
		customQuestions = [{ id: crypto.randomUUID(), rawInput: '' }];
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
						class="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs px-3 py-2 outline-none"
					/>
					<input
						type="text"
						bind:value={setName}
						placeholder="Set Name..."
						class="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs px-3 py-2 outline-none"
					/>
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
						<div class="flex gap-2">
							<label
								class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer"
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
						</div>
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
									class="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
								>
									{isBatchProcessing ? 'Transcribing...' : 'Transcribe All'}
								</button>
							{/if}
						</div>
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
									<span class="truncate">{audio.name}</span>
									<button
										onclick={() => removeAudio(audio.id)}
										class="text-rose-500 font-bold cursor-pointer">✕</button
									>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Question + AnswerKey format section -->
				<div
					class="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
				>
					<div class="flex justify-between items-center">
						<div>
							<h3
								class="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Questions (Question|OptionNo Format)
							</h3>
							<p class="text-[10px] text-slate-400">
								Example: <code class="text-brand-500">What did the speaker buy?|2</code> (Leave empty
								if none)
							</p>
						</div>
						<button
							onclick={addQuestion}
							class="px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
							>+ Add Question</button
						>
					</div>

					<div class="space-y-2">
						{#each customQuestions as q, idx (q.id)}
							<div
								class="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
							>
								<span class="font-bold text-xs text-slate-400">#{idx + 1}</span>
								<input
									type="text"
									bind:value={q.rawInput}
									placeholder="Question text|OptionNo (e.g. Dialogue audio 1|3)"
									class="flex-1 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500"
								/>
								<button
									onclick={() => removeQuestion(q.id)}
									class="text-rose-500 font-bold cursor-pointer px-2">✕</button
								>
							</div>
						{/each}
					</div>
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
