<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { questionSets, userProgress, updateSetProgressIndex } from '#lib/stores.js';
	import type {
		Question,
		QuestionSet,
		QuizConfig,
		UserAnswer,
		FinishEventData,
		Option,
		SetProgress,
		VocabItem
	} from '#lib/types.js';

	let {
		config,
		onfinish,
		onexit
	}: {
		config: QuizConfig;
		onfinish: (data: FinishEventData) => void;
		onexit: () => void;
	} = $props();

	type ExtendedQuestion = Question & {
		contextEnglishText?: string;
		setVocab?: VocabItem[];
	};

	let questions = $state<ExtendedQuestion[]>([]);
	let currentIndex = $state<number>(0);
	let score = $state<number>(0);
	let userAnswers = $state<UserAnswer[]>([]);
	let secondsElapsed = $state<number>(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);

	let selectedOption = $state<number | null>(null);
	let isAnswered = $state<boolean>(false);

	onMount(() => {
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
			const sets: QuestionSet[] = $questionSets;
			const setObj = sets.find((s) => s.id === config.setId);
			if (setObj) {
				questions = setObj.questions.map((q) => ({
					...q,
					setId: setObj.id,
					setTitle: setObj.title,
					contextText: setObj.contextPassages[q.contextIdx] || '',
					contextEnglishText: setObj.contextEnglish?.[q.contextIdx] || '',
					setVocab: setObj.vocab || []
				}));

				const progressData = $userProgress.completedSets[setObj.id];
				if (progressData && typeof progressData === 'object') {
					const savedProgress = progressData as SetProgress;
					if (savedProgress.bestScore !== undefined) {
						score = savedProgress.bestScore;
					}
					if (savedProgress.userAnswers && Array.isArray(savedProgress.userAnswers)) {
						userAnswers = [...savedProgress.userAnswers];
					}

					const firstIncompleteIdx = questions.findIndex(
						(q) => !userAnswers.some((ans) => ans.question.prompt === q.prompt)
					);
					if (firstIncompleteIdx !== -1) {
						currentIndex = firstIncompleteIdx;
					} else if (
						savedProgress.currentIndex !== undefined &&
						savedProgress.currentIndex < questions.length
					) {
						currentIndex = savedProgress.currentIndex;
					}
				}
			}
		} else if (config.mode === 'all') {
			const all: ExtendedQuestion[] = [];
			const sets: QuestionSet[] = $questionSets;
			sets.forEach((setObj) => {
				setObj.questions.forEach((q) => {
					all.push({
						...q,
						setId: setObj.id,
						setTitle: setObj.title,
						contextText: setObj.contextPassages[q.contextIdx] || '',
						contextEnglishText: setObj.contextEnglish?.[q.contextIdx] || '',
						setVocab: setObj.vocab || []
					});
				});
			});
			questions = all;
		}

		syncCurrentQuestionState();
	}

	function syncCurrentQuestionState() {
		if (questions.length === 0) return;
		const q = questions[currentIndex];
		const existingAns = userAnswers.find((ans) => ans.question.prompt === q.prompt);
		if (existingAns) {
			selectedOption = existingAns.selected;
			isAnswered = true;
		} else {
			selectedOption = null;
			isAnswered = false;
		}
	}

	function handleOptionSelect(idx: number) {
		if (isAnswered) return;
		selectedOption = idx;
		isAnswered = true;

		const q = questions[currentIndex];
		const isCorrect = idx === q.answer;

		if (isCorrect) score++;

		userAnswers.push({
			question: q,
			selected: idx,
			isCorrect
		});

		const attemptedCount = new Set(userAnswers.map((a) => a.question.prompt)).size;

		if (config.setId) {
			updateSetProgressIndex(
				config.setId,
				currentIndex,
				questions.length,
				score,
				attemptedCount,
				userAnswers
			);
		}
	}

	function prevQuestion() {
		if (currentIndex > 0) {
			currentIndex--;
			syncCurrentQuestionState();
		}
	}

	function nextQuestion() {
		if (currentIndex + 1 < questions.length) {
			currentIndex++;
			syncCurrentQuestionState();

			const attemptedCount = new Set(userAnswers.map((a) => a.question.prompt)).size;
			if (config.setId) {
				updateSetProgressIndex(
					config.setId,
					currentIndex,
					questions.length,
					score,
					attemptedCount,
					userAnswers
				);
			}
		} else {
			finishQuiz();
		}
	}

	function handleCustomExit() {
		if (config.setId && questions.length > 0) {
			const attemptedCount = new Set(userAnswers.map((a) => a.question.prompt)).size;
			updateSetProgressIndex(
				config.setId,
				currentIndex,
				questions.length,
				score,
				attemptedCount,
				userAnswers
			);
		}
		onexit();
	}

	function finishQuiz() {
		if (timerInterval) clearInterval(timerInterval);
		const activeSetId = config.setId || questions[0]?.setId;
		onfinish({
			score,
			total: questions.length,
			userAnswers,
			secondsElapsed,
			setId: activeSetId
		});
	}

	function getOptionDetails(opt: string | Option): { text: string; kana: string; english: string } {
		if (typeof opt === 'string') {
			return { text: opt, kana: opt, english: 'N/A' };
		}
		return {
			text: opt.text,
			kana: opt.kana || opt.text,
			english: opt.english || 'N/A'
		};
	}

	const completionPercentage = $derived(
		questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0
	);
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<!-- Quiz Control Bar -->
	<div
		class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
	>
		<button
			onclick={handleCustomExit}
			class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition"
			title="Exit Quiz"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				></path></svg
			>
		</button>

		<div class="grow mx-4 max-w-md">
			<div class="flex justify-between text-xs font-semibold mb-1">
				<span class="text-brand-500"
					>{questions[currentIndex]?.setTitle || 'EX-1'}
					{config.practice !== false ? '(Practice)' : '(Assessment)'}</span
				>
				<span>Question {currentIndex + 1} / {questions.length} ({completionPercentage}% done)</span>
			</div>
			<div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
				<div
					class="bg-brand-500 h-full transition-all duration-300"
					style="width: {completionPercentage}%"
				></div>
			</div>
		</div>

		<div class="flex items-center space-x-3 text-sm font-bold">
			{#if config.timed}
				<div
					class="flex items-center space-x-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
					<span
						>{Math.floor(secondsElapsed / 60)
							.toString()
							.padStart(2, '0')}:{(secondsElapsed % 60).toString().padStart(2, '0')}</span
					>
				</div>
			{/if}
			<div
				class="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md text-slate-700 dark:text-slate-200"
			>
				Score: <span>{score}</span>
			</div>
		</div>
	</div>

	{#if questions.length > 0}
		{@const q = questions[currentIndex]}
		<div
			class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-lg relative space-y-6"
		>
			<!-- Context Passage with English Translation Revealed upon Answering -->
			<div
				class="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2"
			>
				<div
					class="text-xl sm:text-2xl font-japanese leading-relaxed text-slate-800 dark:text-slate-200"
				>
					{q.contextText}
				</div>
				{#if isAnswered && q.contextEnglishText}
					<div
						class="text-sm sm:text-base italic text-amber-500/90 dark:text-amber-400/80 font-sans border-t border-slate-200/40 dark:border-slate-800 pt-2"
					>
						{q.contextEnglishText}
					</div>
				{/if}
			</div>

			<!-- Prompt / Target Word with Large, Clear Kanji Sizing -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="inline-block text-xs uppercase font-bold text-slate-400 tracking-wider"
						>Target Word</span
					>
					{#if q.kanjiReading}
						<span
							class="text-xs font-japanese font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
						>
							{q.kanjiReading}
						</span>
					{/if}
				</div>
				<div
					class="text-3xl sm:text-4xl font-bold font-japanese text-brand-600 dark:text-brand-500 leading-relaxed tracking-wide"
				>
					{q.prompt}
				</div>
				{#if isAnswered && q.english}
					<div
						class="text-base sm:text-lg italic text-amber-500/90 dark:text-amber-400/80 font-sans border-t border-slate-200/40 dark:border-slate-800 pt-3 animate-fadeIn font-medium"
					>
						{q.english}
					</div>
				{/if}
			</div>

			<!-- Multiple Choice Options (Enlarged for readability) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each q.options as opt, idx (idx)}
					{@const details = getOptionDetails(opt)}
					<button
						disabled={isAnswered}
						onclick={() => handleOptionSelect(idx)}
						class="p-4 rounded-xl border text-left transition duration-150 flex flex-col justify-between
              {isAnswered && idx === q.answer
							? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
							: ''}
              {isAnswered && idx === selectedOption && idx !== q.answer
							? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
							: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 hover:bg-brand-50/50'}"
					>
						<div class="font-japanese text-xl sm:text-2xl font-medium flex items-center space-x-2">
							<span class="text-xs text-slate-400 font-sans">{idx + 1}.</span>
							<span>{details.text}</span>
						</div>

						{#if isAnswered}
							<div
								class="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex justify-between border-t border-slate-200/60 dark:border-slate-700 pt-2"
							>
								<span>Kana: <strong class="font-japanese text-sm">{details.kana}</strong></span>
								<span>Eng: <strong class="font-medium">{details.english}</strong></span>
							</div>
						{/if}
					</button>
				{/each}
			</div>

			{#if isAnswered}
				{@const isCorrect = selectedOption === q.answer}
				{@const correctOpt = getOptionDetails(q.options[q.answer])}
				<div
					class="p-4 rounded-xl border transition-all {isCorrect
						? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
						: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'}"
				>
					<div class="flex items-start space-x-3">
						<div
							class="p-1.5 rounded-full text-white shrink-0 {isCorrect
								? 'bg-emerald-500'
								: 'bg-rose-500'}"
						>
							{#if isCorrect}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									></path></svg
								>
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									></path></svg
								>
							{/if}
						</div>
						<div>
							<h4 class="font-bold text-base">
								{isCorrect ? '正解 (Correct!)' : '不正解 (Incorrect)'}
							</h4>
							<p class="text-sm sm:text-base mt-0.5 text-slate-700 dark:text-slate-200">
								{isCorrect
									? `"${q.kanji || q.prompt}" (${q.reading || correctOpt.kana}) is correct.`
									: `The correct answer is "${correctOpt.text}" (${correctOpt.english}).`}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Footer Actions -->
			<div
				class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700"
			>
				<button
					onclick={prevQuestion}
					disabled={currentIndex === 0}
					class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm rounded-xl transition disabled:opacity-40 disabled:hover:bg-transparent"
				>
					← Previous
				</button>

				<div class="flex space-x-2">
					{#if !isAnswered}
						<button
							onclick={() => {
								userAnswers.push({ question: q, selected: -1, isCorrect: false });
								nextQuestion();
							}}
							class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm rounded-xl transition"
						>
							Skip
						</button>
					{:else}
						<button
							onclick={nextQuestion}
							class="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow transition flex items-center space-x-1"
						>
							<span>{currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path></svg
							>
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
