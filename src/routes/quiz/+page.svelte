<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { questionSets } from '#lib/stores.js';
	import type {
		Question,
		QuestionSet,
		QuizConfig,
		UserAnswer,
		Option,
		VocabItem
	} from '#lib/types.js';
	import type { QuestionListeningSet } from '#lib/types/listening.ts';

	let config: QuizConfig = $state({ mode: 'all', practice: true });
	let currentSet = $state<QuestionListeningSet | null>(null);
	let questions = $state<ExtendedQuestion[]>([]);
	let currentIndex = $state<number>(0);
	let score = $state<number>(0);
	let userAnswers = $state<UserAnswer[]>([]);
	let secondsElapsed = $state<number>(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let isAnswered = $state<boolean>(false);
	let selectedOptionIdx = $state<number | null>(null);

	// PDF viewer state for listening mode
	let currentPdfIndex = $state<number>(0);

	type ExtendedQuestion = Question & {
		contextEnglishText?: string;
		setVocab?: VocabItem[];
		audioUrl?: string;
	};

	onMount(() => {
		const storedConfig = sessionStorage.getItem('current_quiz_config');
		if (storedConfig) {
			config = JSON.parse(storedConfig);
		}
		loadQuestions();
		if (config.timed) {
			timerInterval = setInterval(() => {
				secondsElapsed++;
			}, 1000);
		}
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function loadQuestions() {
		if (config.customQuestions) {
			questions = config.customQuestions as ExtendedQuestion[];
		} else if (config.mode === 'exercise' && config.setId) {
			const setObj = ($questionSets as QuestionSet[]).find((s) => s.id === config.setId);
			if (setObj) {
				currentSet = setObj as QuestionListeningSet;
				questions = setObj.questions.map((q, idx) => {
					const audioItem = currentSet?.audioItems?.[idx];
					const audioUrl = audioItem?.file ? URL.createObjectURL(audioItem.file) : audioItem?.url;

					return {
						...q,
						setId: setObj.id,
						setTitle: setObj.title,
						contextText: setObj.contextPassages[q.contextIdx] || '',
						contextEnglishText: setObj.contextEnglish?.[q.contextIdx] || '',
						setVocab: setObj.vocab || [],
						audioUrl
					};
				});
			}
		} else if (config.mode === 'all') {
			const all: ExtendedQuestion[] = [];
			($questionSets as QuestionSet[]).forEach((setObj) => {
				setObj.questions.forEach((q) => {
					all.push({
						...q,
						setId: setObj.id,
						setTitle: setObj.title,
						contextText: setObj.contextPassages[q.contextIdx] || ''
					});
				});
			});
			questions = all;
		}
	}

	function handleOptionSelect(idx: number) {
		if (isAnswered) return;
		isAnswered = true;
		selectedOptionIdx = idx;
		const q = questions[currentIndex];
		const isCorrect = idx === q.answer;
		if (isCorrect) score++;

		userAnswers.push({ question: q, selected: idx, isCorrect });
	}

	async function nextQuestion() {
		if (currentIndex + 1 < questions.length) {
			currentIndex++;
			isAnswered = false;
			selectedOptionIdx = null;
		} else {
			if (timerInterval) clearInterval(timerInterval);
			sessionStorage.setItem(
				'last_quiz_result',
				JSON.stringify({
					score,
					total: questions.length,
					userAnswers,
					secondsElapsed,
					setId: config.setId || questions[0]?.setId
				})
			);
			await goto(resolve('/summary'));
		}
	}

	function getOptionDetails(opt: string | Option) {
		if (typeof opt === 'string') return { text: opt, kana: opt, english: 'N/A' };
		return { text: opt.text, kana: opt.kana || opt.text, english: opt.english || 'N/A' };
	}

	function prevPdf() {
		if (currentPdfIndex > 0) currentPdfIndex--;
	}
	function nextPdf() {
		if (currentSet?.pdfFiles && currentPdfIndex < currentSet.pdfFiles.length - 1) {
			currentPdfIndex++;
		}
	}
</script>

<div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
	{#if questions.length > 0}
		{@const q = questions[currentIndex]}
		{@const isListeningMode = currentSet?.category === 'listening'}
		{@const pdfFiles = currentSet?.pdfFiles || []}

		{#if isListeningMode}
			<!-- LISTENING MODE: Split layout with PDF previewer, Audio player & Options -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Left Column: PDF Booklet Cross-Viewer -->
				<div
					class="flex flex-col space-y-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[550px]"
				>
					<div class="flex justify-between items-center">
						<h3
							class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider"
						>
							Question Booklet PDFs ({pdfFiles.length})
						</h3>
						{#if pdfFiles.length > 0}
							<div
								class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
							>
								<button
									onclick={prevPdf}
									disabled={currentPdfIndex === 0}
									class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
									>&lt;</button
								>
								<span>{currentPdfIndex + 1} / {pdfFiles.length}</span>
								<button
									onclick={nextPdf}
									disabled={currentPdfIndex === pdfFiles.length - 1}
									class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
									>&gt;</button
								>
							</div>
						{/if}
					</div>

					<div
						class="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center"
					>
						{#if pdfFiles.length > 0 && pdfFiles[currentPdfIndex]}
							<iframe
								src={`${pdfFiles[currentPdfIndex].url}#view=FitH`}
								title={pdfFiles[currentPdfIndex].name}
								class="w-full h-full min-h-[450px] border-0"
							></iframe>
						{:else}
							<div class="text-center p-6 text-slate-400 text-xs space-y-1">
								<p class="text-2xl">📄</p>
								<p>No booklet PDF attached to this set.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: Audio Player & Options -->
				<div
					class="flex flex-col space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm justify-between"
				>
					<div class="space-y-4">
						<!-- Audio Player -->
						<div
							class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
						>
							<div class="text-xs font-bold text-slate-500 uppercase tracking-wide">
								Audio Track {currentIndex + 1}
							</div>
							{#if q.audioUrl}
								<audio controls class="w-full h-10" src={q.audioUrl}>
									Your browser does not support audio playback.
								</audio>
							{:else}
								<p class="text-xs text-slate-400 italic">
									No audio track URL attached for this item.
								</p>
							{/if}
						</div>

						<div class="text-2xl font-bold font-japanese text-slate-800 dark:text-slate-100">
							{q.prompt}
						</div>

						<!-- Options with Immediate Answer Revelation -->
						<div class="grid grid-cols-1 gap-3">
							{#each q.options as opt, idx (idx)}
								{@const details = getOptionDetails(opt)}
								{@const isSelected = selectedOptionIdx === idx}
								{@const isCorrectAnswer = idx === q.answer}

								<button
									disabled={isAnswered}
									onclick={() => handleOptionSelect(idx)}
									class={`p-4 rounded-xl border text-left transition font-japanese text-base cursor-pointer flex justify-between items-center ${
										isAnswered
											? isCorrectAnswer
												? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
												: isSelected
													? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
													: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
											: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-500'
									}`}
								>
									<span>{details.text}</span>
									{#if isAnswered}
										<span class="text-xs font-bold">
											{isCorrectAnswer ? '✅ Correct' : isSelected ? '❌ Selected' : ''}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>

					{#if isAnswered}
						<button
							onclick={nextQuestion}
							class="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
						>
							{currentIndex + 1 < questions.length
								? 'Next Question →'
								: 'Finish Quiz & View Summary'}
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<!-- STANDARD MODE (Kanji / Vocabulary sets) -->
			<div
				class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg space-y-6"
			>
				<div class="text-xl font-japanese text-slate-800 dark:text-slate-200">{q.contextText}</div>
				<div class="text-3xl font-bold font-japanese text-brand-600">{q.prompt}</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each q.options as opt, idx (idx)}
						{@const details = getOptionDetails(opt)}
						<button
							disabled={isAnswered}
							onclick={() => handleOptionSelect(idx)}
							class="p-4 rounded-xl border text-left bg-white dark:bg-slate-800 hover:border-brand-500"
						>
							<div class="font-japanese text-xl">{details.text}</div>
						</button>
					{/each}
				</div>

				{#if isAnswered}
					<button
						onclick={nextQuestion}
						class="px-6 py-2 bg-brand-500 text-white font-bold rounded-xl shadow"
						>Next Question</button
					>
				{/if}
			</div>
		{/if}
	{/if}
</div>
