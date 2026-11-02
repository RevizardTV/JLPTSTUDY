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

	let config: QuizConfig = $state({ mode: 'all', practice: true });
	let questions = $state<ExtendedQuestion[]>([]);
	let currentIndex = $state<number>(0);
	let score = $state<number>(0);
	let userAnswers = $state<UserAnswer[]>([]);
	let secondsElapsed = $state<number>(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let isAnswered = $state<boolean>(false);

	type ExtendedQuestion = Question & { contextEnglishText?: string; setVocab?: VocabItem[] };

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
				questions = setObj.questions.map((q) => ({
					...q,
					setId: setObj.id,
					setTitle: setObj.title,
					contextText: setObj.contextPassages[q.contextIdx] || '',
					contextEnglishText: setObj.contextEnglish?.[q.contextIdx] || '',
					setVocab: setObj.vocab || []
				}));
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
		const q = questions[currentIndex];
		const isCorrect = idx === q.answer;
		if (isCorrect) score++;

		userAnswers.push({ question: q, selected: idx, isCorrect });
	}

	async function nextQuestion() {
		if (currentIndex + 1 < questions.length) {
			currentIndex++;
			isAnswered = false;
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
			// Wrapped with resolve() per svelte/no-navigation-without-resolve
			await goto(resolve('/summary'));
		}
	}

	function getOptionDetails(opt: string | Option) {
		if (typeof opt === 'string') return { text: opt, kana: opt, english: 'N/A' };
		return { text: opt.text, kana: opt.kana || opt.text, english: opt.english || 'N/A' };
	}
</script>

<div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
	{#if questions.length > 0}
		{@const q = questions[currentIndex]}
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
</div>
