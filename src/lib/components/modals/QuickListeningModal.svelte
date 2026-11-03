<script lang="ts">
	import type { ListeningQuestionItem } from '#lib/types/listening.ts';
	import { transcribeItem, transcribeAllItems } from '#lib/utils/transcribeHelper.ts';

	// 1. Explicitly mark isOpen as $bindable so the parent page can use bind:isOpen
	let { isOpen = $bindable(false), onClose = () => {} }: { isOpen: boolean; onClose?: () => void } =
		$props();

	// 2. Explicitly type all state arrays and values to prevent 'never' inference
	let audioItems = $state<ListeningQuestionItem[]>([]);
	let pdfUrls = $state<{ url: string; name: string }[]>([]);

	let currentAudioIndex = $state<number>(0);
	let currentPdfIndex = $state<number>(0);
	let activeTab = $state<'kanji' | 'kana' | 'english'>('kanji');
	let isBatchProcessing = $state<boolean>(false);

	// Handle File Selection (Audios & PDFs)
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
					error: null
				});
			} else if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
				pdfUrls.push({ url: URL.createObjectURL(file), name: file.name });
			}
		}
	}

	// Transcribe a single audio item using our helper
	async function handleSingleTranscribe(index: number) {
		if (audioItems[index]) {
			await transcribeItem(audioItems[index]);
		}
	}

	// Batch transcribe all items using our helper
	async function handleBatchTranscribe() {
		isBatchProcessing = true;
		await transcribeAllItems(audioItems);
		isBatchProcessing = false;
	}

	// PDF Pagination controls
	function prevPdf() {
		if (currentPdfIndex > 0) currentPdfIndex--;
	}

	function nextPdf() {
		if (currentPdfIndex < pdfUrls.length - 1) currentPdfIndex++;
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
	>
		<div
			class="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
		>
			<!-- Modal Header -->
			<div
				class="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
			>
				<div>
					<h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
						QuickListening Mass Workspace
					</h2>
					<p class="text-xs text-slate-500 dark:text-slate-400">
						Upload multiple listening tracks and PDF questions/scripts simultaneously.
					</p>
				</div>
				<button
					onclick={() => {
						isOpen = false;
						onClose();
					}}
					class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer font-bold text-sm"
				>
					✕
				</button>
			</div>

			<!-- Modal Body Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
				<!-- Left Column: PDF Question Viewer with < > Navigation -->
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
								>
									&lt;
								</button>
								<span>{currentPdfIndex + 1} / {pdfUrls.length}</span>
								<button
									onclick={nextPdf}
									disabled={currentPdfIndex === pdfUrls.length - 1}
									class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 cursor-pointer shadow-xs"
								>
									&gt;
								</button>
							</div>
						{/if}
					</div>

					<!-- PDF Display Area -->
					<div
						class="flex-1 min-h-87.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative shadow-inner"
					>
						{#if pdfUrls.length > 0 && pdfUrls[currentPdfIndex]}
							<iframe
								src={`${pdfUrls[currentPdfIndex].url}#view=FitH`}
								title={pdfUrls[currentPdfIndex].name}
								class="w-full h-full min-h-87.5 border-0"
							></iframe>
						{:else}
							<div class="text-center p-6 space-y-2 text-slate-400">
								<div class="text-3xl">📄</div>
								<p class="text-xs">No PDF scripts uploaded yet. Add files below.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: Audio List & Transcription Breakdown -->
				<div class="flex flex-col space-y-4">
					<div class="flex justify-between items-center">
						<h3
							class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider"
						>
							Audio Tracks ({audioItems.length})
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

					<!-- Audio Items List with Keyed each block -->
					<div class="flex-1 min-h-87.5 max-h-87.5 overflow-y-auto space-y-3 pr-1">
						{#if audioItems.length === 0}
							<div
								class="h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2"
							>
								<div class="text-3xl">🎵</div>
								<p class="text-xs">Upload audio files and PDFs to start your practice session.</p>
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
										<button
											onclick={() => handleSingleTranscribe(idx)}
											disabled={item.loading}
											class="px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition shrink-0"
										>
											{item.loading ? 'Transcribing...' : item.kanji ? 'Re-run' : 'Transcribe'}
										</button>
									</div>

									{#if item.error}
										<p class="text-[11px] text-rose-500 font-semibold">{item.error}</p>
									{/if}

									<!-- Output tabs for this specific track -->
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
												{#if activeTab === 'kanji'}
													{item.kanji}
												{:else if activeTab === 'kana'}
													{item.kana}
												{:else}
													{item.english}
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}
							%}{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
