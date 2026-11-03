<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { questionSets } from '#lib/stores.js';
	import type { QuestionSet, QuizConfig, UserAnswer, Question, Option } from '#lib/types.js';
	import type { QuestionListeningSet } from '#lib/types/listening.ts';

	type ListeningQuizQuestion = Question & {
		answerText?: string;
	};

	let config: QuizConfig = $state({ mode: 'exercise', practice: true });
	let currentSet = $state<QuestionListeningSet | null>(null);
	let questions = $state<ListeningQuizQuestion[]>([]);
	let currentIndex = $state<number>(0);
	let score = $state<number>(0);
	let userAnswers = $state<UserAnswer[]>([]);
	let secondsElapsed = $state<number>(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let isAnswered = $state<boolean>(false);
	let selectedOptionIdx = $state<number | null>(null);

	// Independent navigation indices for Listening Mode
	let currentPdfIndex = $state<number>(0);
	let currentAudioIndex = $state<number>(0);

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
		if (config.setId) {
			const setObj = ($questionSets as QuestionSet[]).find((s) => s.id === config.setId);
			if (setObj) {
				currentSet = setObj as QuestionListeningSet;
				questions = (setObj.questions || []) as ListeningQuizQuestion[];
			}
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
					setId: config.setId
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
		if (currentSet?.pdfFiles && currentPdfIndex < currentSet.pdfFiles.length - 1) currentPdfIndex++;
	}

	function prevAudio() {
		if (currentSet?.audioItems && currentAudioIndex > 0) currentAudioIndex--;
	}
	function nextAudio() {
		if (currentSet?.audioItems && currentAudioIndex < currentSet.audioItems.length - 1)
			currentAudioIndex++;
	}
</script>

<div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
	{#if questions.length > 0}
		{@const q = questions[currentIndex]}
		{@const isListeningMode = currentSet?.category === 'listening'}
		{@const pdfFiles = currentSet?.pdfFiles || []}
		{@const audioItems = currentSet?.audioItems || []}
		{@const activeAudio = audioItems[currentAudioIndex]}

		{#if isListeningMode}
			<!-- LISTENING MODE: Large PDF on Top, Independent Audio Navigation, Standard Clickable Options -->
			<div class="flex flex-col space-y-6">
				<!-- Top Section: Large PDF Booklet Viewer with Independent Navigation -->
				<div
					class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
				>
					<div class="flex justify-between items-center">
						<h3
							class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider"
						>
							Question Booklet PDF Viewer ({pdfFiles.length})
						</h3>
						{#if pdfFiles.length > 0}
							<div
								class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
							>
								<button
									onclick={prevPdf}
									disabled={currentPdfIndex === 0}
									class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
									>&lt; Prev PDF</button
								>
								<span>{currentPdfIndex + 1} / {pdfFiles.length}</span>
								<button
									onclick={nextPdf}
									disabled={currentPdfIndex === pdfFiles.length - 1}
									class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
									>Next PDF &gt;</button
								>
							</div>
						{/if}
					</div>

					<div
						class="w-full h-137.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center"
					>
						{#if pdfFiles.length > 0 && pdfFiles[currentPdfIndex]}
							<iframe
								src={`${pdfFiles[currentPdfIndex].url}#view=FitH`}
								title={pdfFiles[currentPdfIndex].name}
								class="w-full h-full border-0"
							></iframe>
						{:else}
							<div class="text-center p-6 text-slate-400 text-xs space-y-1">
								<p class="text-3xl">📄</p>
								<p>No PDF booklets attached to this set.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Bottom Section: Independent Audio Player & Standard Clickable Options -->
				<div
					class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
				>
					<!-- Independent Audio Track Navigation -->
					<div
						class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
					>
						<div class="flex justify-between items-center">
							<span class="text-xs font-bold text-slate-500 uppercase tracking-wide">
								Audio Player (Track {currentAudioIndex + 1} of {audioItems.length})
							</span>
							{#if audioItems.length > 1}
								<div class="flex items-center gap-2 text-xs">
									<button
										onclick={prevAudio}
										disabled={currentAudioIndex === 0}
										class="px-2 py-0.5 bg-white dark:bg-slate-800 border rounded disabled:opacity-30 cursor-pointer"
										>&lt; Prev Audio</button
									>
									<button
										onclick={nextAudio}
										disabled={currentAudioIndex === audioItems.length - 1}
										class="px-2 py-0.5 bg-white dark:bg-slate-800 border rounded disabled:opacity-30 cursor-pointer"
										>Next Audio &gt;</button
									>
								</div>
							{/if}
						</div>

						{#if activeAudio}
							<audio
								controls
								class="w-full h-10"
								src={activeAudio.url || URL.createObjectURL(activeAudio.file)}
							>
								Your browser does not support audio playback.
							</audio>
							<div class="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
								Playing: {activeAudio.name}
							</div>
						{:else}
							<p class="text-xs text-slate-400 italic">No audio tracks available.</p>
						{/if}
					</div>

					<!-- Question & Clickable Options Grid -->
					<div class="space-y-4">
						<div class="text-lg font-bold text-slate-900 dark:text-slate-100 font-japanese">
							Question {currentIndex + 1}: {q.prompt}
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

						{#if isAnswered}
							<div class="pt-2 flex justify-end">
								<button
									onclick={nextQuestion}
									class="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
								>
									{currentIndex + 1 < questions.length
										? 'Next Question →'
										: 'Finish Quiz & View Summary'}
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<!-- STANDARD MODE -->
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
			</div>
		{/if}
	{/if}
</div>
