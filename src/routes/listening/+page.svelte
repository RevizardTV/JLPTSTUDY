<script lang="ts">
	import { questionSets, userProgress } from '#lib/stores.js';
	import type { QuestionSet } from '#lib/types.js';
	import type { QuestionListeningSet } from '#lib/types/listening.ts';
	import AudioQuestionSetCard from '#lib/components/cards/AudioQuestionSetCard.svelte';
	import ListeningFilters from '#lib/components/filters/ListeningFilter.svelte';
	import QuickListeningModal from '#lib/components/modals/QuickListeningModal.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let isQuickModalOpen = $state(false);

	// Filter states
	let selectedPacks = new SvelteSet<string>();
	let questionSearchQuery = $state('');

	// Filter only listening question sets based on selected pack tags and question text
	let filteredListeningSets = $derived(() => {
		const sets = ($questionSets as QuestionSet[]).filter(
			(s) => s.category === 'listening'
		) as QuestionListeningSet[];

		const qQuery = questionSearchQuery.toLowerCase().trim();

		return sets.filter((set) => {
			const matchesPack =
				selectedPacks.size === 0 || (set.packTitle && selectedPacks.has(set.packTitle));

			const matchesQuestion =
				!qQuery ||
				(set.questions &&
					set.questions.some((q) => q.prompt && q.prompt.toLowerCase().includes(qQuery)));

			return matchesPack && matchesQuestion;
		});
	});
</script>

<div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">
				JLPT Listening Practice
			</h1>
			<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
				Manage your listening sets, audio transcripts, and practice modes.
			</p>
		</div>

		<button
			onclick={() => (isQuickModalOpen = true)}
			class="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center space-x-2"
		>
			<span>⚡ QuickListening Setup</span>
		</button>
	</div>

	<ListeningFilters bind:selectedPacks bind:questionSearchQuery />

	{#if filteredListeningSets().length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredListeningSets() as set (set.id)}
				{@const progress = $userProgress.completedSets[set.id]}
				<AudioQuestionSetCard {set} {progress} />
			{/each}
		</div>
	{:else}
		<div
			class="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3"
		>
			<p class="text-4xl">🎧</p>
			<h3 class="font-bold text-sm text-slate-700 dark:text-slate-300">No listening sets found</h3>
			<p class="text-xs text-slate-400 max-w-sm mx-auto">
				Try clearing your filters or click "QuickListening Setup" to create a new listening practice
				set.
			</p>
		</div>
	{/if}
</div>

<QuickListeningModal bind:isOpen={isQuickModalOpen} />
