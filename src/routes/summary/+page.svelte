<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { recordQuizCompletion } from '#lib/stores.js';
	import type { FinishEventData } from '#lib/types.js';

	let data = $state<FinishEventData | null>(null);
	let savedSuccessfully = $state<boolean>(false);

	onMount(() => {
		const rawResult = sessionStorage.getItem('last_quiz_result');
		if (rawResult) {
			try {
				data = JSON.parse(rawResult);
				if (data && data.setId) {
					recordQuizCompletion(data);
					savedSuccessfully = true;
				}
			} catch (e) {
				console.error('Failed to parse quiz result from session storage', e);
			}
		}
	});

	const percentage = $derived(
		data && data.total > 0 ? Math.round((data.score / data.total) * 100) : 0
	);

	async function navigateTo(path: '/' | '/stats') {
		await goto(resolve(path));
	}
</script>

<div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
	{#if savedSuccessfully}
		<div
			class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm"
		>
			<span class="text-base">✅</span>
			<span
				>Quiz results successfully recorded! Your set completion and best score have been updated on
				your dashboard.</span
			>
		</div>
	{/if}

	{#if data}
		<div
			class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-lg space-y-4"
		>
			<span
				class="inline-block px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-bold uppercase tracking-wider"
			>
				Quiz Completed!
			</span>

			<h2 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Your Results</h2>

			<div class="text-6xl font-black text-brand-500 my-2">
				{percentage}%
			</div>

			<p class="text-sm text-slate-500 dark:text-slate-400">
				You scored <strong class="text-slate-800 dark:text-slate-200">{data.score}</strong> out of
				<strong class="text-slate-800 dark:text-slate-200">{data.total}</strong>
				correct in {Math.floor(data.secondsElapsed / 60)}m {data.secondsElapsed % 60}s.
			</p>

			<div class="pt-4 flex flex-col sm:flex-row justify-center gap-3">
				<button
					onclick={() => navigateTo('/')}
					class="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition"
				>
					Return to Dashboard
				</button>
				<button
					onclick={() => navigateTo('/stats')}
					class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
				>
					View Analytics
				</button>
			</div>
		</div>

		<!-- Detailed Answer Review List -->
		<div
			class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4"
		>
			<h3 class="font-bold text-slate-800 dark:text-slate-100 text-base">Question Breakdown</h3>

			<div class="space-y-3">
				{#each data.userAnswers as ans, idx (idx)}
					<div
						class="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 flex items-start justify-between gap-4"
					>
						<div>
							<div class="text-xs font-bold text-slate-400 mb-1">Question {idx + 1}</div>
							<div class="text-sm font-semibold text-slate-800 dark:text-slate-200">
								{ans.question.prompt}
							</div>
							<div class="text-xs text-slate-500 mt-1">
								Your Choice: <span
									class={ans.isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}
									>{ans.question.options[ans.selected]?.text || 'None'}</span
								>
							</div>
						</div>
						<div>
							{#if ans.isCorrect}
								<span
									class="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold"
									>Correct</span
								>
							{:else}
								<span class="px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold"
									>Incorrect</span
								>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div
			class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-4"
		>
			<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
				No active quiz result found.
			</h3>
			<p class="text-xs text-slate-400">
				Please complete a quiz session to view your summary statistics.
			</p>
			<button
				onclick={() => navigateTo('/')}
				class="px-6 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition"
			>
				Return to Dashboard
			</button>
		</div>
	{/if}
</div>
