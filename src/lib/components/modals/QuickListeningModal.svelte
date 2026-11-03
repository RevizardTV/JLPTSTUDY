<script lang="ts">
	import type { ListeningQuestionItem } from '#lib/types/listening.ts';
	import { transcribeItem, transcribeAllItems } from '#lib/utils/transcribeHelper.ts';
	import { questionSets } from '#lib/stores.ts';

	let {
		isOpen = $bindable(false),
		onClose = () => {}
	}: {
		isOpen: boolean;
		onClose?: () => void;
	} = $props();

	// Pack & Set Info
	let packTitle = $state<string>('');
	let setName = $state<string>('');

	let audioItems = $state<
		(ListeningQuestionItem & { customPrompt: string; correctOptionIndex: number })[]
	>([]);
	let pdfUrls = $state<{ id: string; url: string; name: string }[]>([]);

	let currentAudioIndex = $state<number>(0);
	let currentPdfIndex = $state<number>(0);
	let activeTab = $state<'kanji' | 'kana' | 'english'>('kanji');
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
					customPrompt: `Question ${audioItems.length + 1}`,
					correctOptionIndex: 0
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

	async function handleSingleTranscribe(index: number) {
		if (audioItems[index]) {
			await transcribeItem(audioItems[index]);
		}
	}

	async function handleBatchTranscribe() {
		isBatchProcessing = true;
		await transcribeAllItems(audioItems);
		isBatchProcessing = false;
	}

	function prevPdf() {
		if (currentPdfIndex > 0) currentPdfIndex--;
	}
	function nextPdf() {
		if (currentPdfIndex < pdfUrls.length - 1) currentPdfIndex++;
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
			questions: audioItems.map((item, idx) => ({
				qNum: idx + 1,
				prompt: item.customPrompt || item.name,
				contextIdx: 0,
				options: [
					{ text: item.kanji || 'Option 1', kana: item.kana, english: item.english },
					{ text: 'Option 2', kana: '', english: '' },
					{ text: 'Option 3', kana: '', english: '' },
					{ text: 'Option 4', kana: '', english: '' }
				],
				answer: item.correctOptionIndex,
				kanji: item.kanji,
				reading: item.kana
			})),
			vocab: [],
			pdfFiles: pdfUrls.map((p) => ({ url: p.url, name: p.name })),
			audioItems: audioItems,
			createdAt: new Date()
		};

		// Directly push into the questionSets store so it updates the UI instantly
		questionSets.update((sets) => [newListeningSet, ...sets]);

		// Reset and close
		isOpen = false;
		packTitle = '';
		setName = '';
		audioItems = [];
		pdfUrls = [];
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
			<!-- Modal Header: Pack & Set Inputs -->
			<div
				class="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 gap-3"
			>
				<div class="flex items-center gap-3 w-full">
					<input
						type="text"
						bind:value={packTitle}
						placeholder="Pack Title (e.g. JLPT N3 Mock)..."
						class="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:border-brand-500 transition"
					/>
					<input
						type="text"
						bind:value={setName}
						placeholder="Set Name (e.g. Test 1)..."
						class="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:border-brand-500 transition"
					/>
				</div>
				<button
					onclick={() => (isOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer font-bold text-sm shrink-0"
				>
					✕
				</button>
			</div>

			<!-- Modal Body Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
				<!-- Left Column: PDF Question Viewer -->
				<div
					class="flex flex-col space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
				>
					<div class="flex justify-between items-center">
						<h3
							class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider"
						>
							Question PDFs ({pdfUrls.length})
						</h3>
						{#if pdfUrls.length > 0}
							<div
								class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
							>
								<button
									onclick={prevPdf}
									disabled={currentPdfIndex === 0}
									class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 cursor-pointer shadow-xs"
									>&lt;</button
								>
								<span>{currentPdfIndex + 1} / {pdfUrls.length}</span>
								<button
									onclick={nextPdf}
									disabled={currentPdfIndex === pdfUrls.length - 1}
									class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 cursor-pointer shadow-xs"
									>&gt;</button
								>
							</div>
						{/if}
					</div>

					<div
						class="flex-1 min-h-87.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden relative shadow-inner"
					>
						{#if pdfUrls.length > 0 && pdfUrls[currentPdfIndex]}
							<div
								class="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 text-xs"
							>
								<span class="truncate font-medium text-slate-700 dark:text-slate-300"
									>{pdfUrls[currentPdfIndex].name}</span
								>
								<button
									onclick={() => removePdf(pdfUrls[currentPdfIndex].id)}
									class="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded cursor-pointer"
									>Remove ✕</button
								>
							</div>
							<iframe
								src={`${pdfUrls[currentPdfIndex].url}#view=FitH`}
								title={pdfUrls[currentPdfIndex].name}
								class="w-full flex-1 border-0"
							></iframe>
						{:else}
							<div
								class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400 my-auto"
							>
								<div class="text-3xl">📄</div>
								<p class="text-xs">No PDF scripts uploaded yet. Add files below.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: Audio Tracks, Blank Questions & Answer Keys -->
				<div class="flex flex-col space-y-4">
					<div class="flex justify-between items-center">
						<h3
							class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider"
						>
							Audio Tracks & Questions ({audioItems.length})
						</h3>
						<div class="flex items-center gap-2">
							{#if audioItems.length > 0}
								<button
									onclick={handleBatchTranscribe}
									disabled={isBatchProcessing}
									class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
								>
									{isBatchProcessing ? 'Transcribing All...' : 'Auto-Transcribe All'}
								</button>
							{/if}
							<label
								class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition"
							>
								+ Add Files
								<input
									type="file"
									multiple
									accept="audio/*,application/pdf"
									onchange={handleFilesSelected}
									class="hidden"
								/>
							</label>
						</div>
					</div>

					<div class="flex-1 min-h-87.5 max-h-87.5 overflow-y-auto space-y-3 pr-1">
						{#if audioItems.length === 0}
							<div
								class="h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2"
							>
								<div class="text-3xl">🎵</div>
								<p class="text-xs">Upload audio files and PDFs to start setting up questions.</p>
							</div>
						{:else}
							{#each audioItems as item, idx (item.id)}
								<div
									class={`p-4 rounded-xl border transition space-y-3 ${currentAudioIndex === idx ? 'border-brand-500 bg-brand-500/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
								>
									<div class="flex justify-between items-center gap-2">
										<button
											onclick={() => (currentAudioIndex = idx)}
											class="font-bold text-xs text-slate-800 dark:text-slate-200 truncate text-left hover:text-brand-500 flex-1 cursor-pointer"
										>
											{idx + 1}. {item.name}
										</button>
										<div class="flex items-center gap-1.5 shrink-0">
											<button
												onclick={() => handleSingleTranscribe(idx)}
												disabled={item.loading}
												class="px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition"
											>
												{item.loading ? 'Transcribing...' : item.kanji ? 'Re-run' : 'Transcribe'}
											</button>
											<button
												onclick={() => removeAudio(item.id)}
												class="p-1 text-slate-400 hover:text-rose-500 rounded-lg font-bold text-xs transition cursor-pointer"
												>✕</button
											>
										</div>
									</div>

									<!-- Blank Question Prompt Input & Answer Key Select -->
									<div class="grid grid-cols-3 gap-2 pt-1">
										<div class="col-span-2">
											<input
												type="text"
												bind:value={item.customPrompt}
												placeholder="Enter question text / prompt..."
												class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
											/>
										</div>
										<div>
											<select
												bind:value={item.correctOptionIndex}
												class="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
											>
												<option value={0}>Answer: Opt 1</option>
												<option value={1}>Answer: Opt 2</option>
												<option value={2}>Answer: Opt 3</option>
												<option value={3}>Answer: Opt 4</option>
											</select>
										</div>
									</div>

									{#if item.error}
										<p class="text-[11px] text-rose-500 font-semibold">{item.error}</p>
									{/if}

									{#if item.kanji || item.kana || item.english}
										<div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
											<div
												class="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]"
											>
												<button
													class={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${activeTab === 'kanji' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400'}`}
													onclick={() => (activeTab = 'kanji')}>Kanji</button
												>
												<button
													class={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${activeTab === 'kana' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400'}`}
													onclick={() => (activeTab = 'kana')}>Kana</button
												>
												<button
													class={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${activeTab === 'english' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400'}`}
													onclick={() => (activeTab = 'english')}>English</button
												>
											</div>

											<div
												class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-japanese text-slate-700 dark:text-slate-300 min-h-12 max-h-24 overflow-y-auto"
											>
												{#if activeTab === 'kanji'}{item.kanji}{:else if activeTab === 'kana'}{item.kana}{:else}{item.english}{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>

			<!-- Modal Footer -->
			<div
				class="flex justify-end items-center px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 gap-3"
			>
				<button
					onclick={() => (isOpen = false)}
					class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition"
					>Cancel</button
				>
				<button
					onclick={handleSaveSet}
					disabled={audioItems.length === 0}
					class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-2"
				>
					<span>💾</span>
					<span>Upload & Save Question Set</span>
				</button>
			</div>
		</div>
	</div>
{/if}
