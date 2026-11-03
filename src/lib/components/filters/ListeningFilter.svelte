<script lang="ts">
	import { questionSets } from '#lib/stores.js';
	import { SvelteSet } from 'svelte/reactivity';
	import type { QuestionListeningSet } from '#lib/types/listening.ts';

	let {
		selectedPacks = $bindable(),
		questionSearchQuery = $bindable()
	}: {
		selectedPacks: Set<string>;
		questionSearchQuery: string;
	} = $props();

	let packSearchQuery = $state('');

	// Dynamically extract unique pack titles
	let allPacks = $derived(() => {
		const set = new SvelteSet<string>();
		($questionSets as QuestionListeningSet[]).forEach((qSet) => {
			if (qSet.packTitle) set.add(qSet.packTitle);
		});
		return Array.from(set);
	});

	let filteredAndSortedPacks = $derived(() => {
		const query = packSearchQuery.toLowerCase().trim();
		return allPacks()
			.filter((pack) => pack.toLowerCase().includes(query))
			.sort((a, b) => {
				const aChecked = selectedPacks.has(a);
				const bChecked = selectedPacks.has(b);
				if (aChecked && !bChecked) return -1;
				if (!aChecked && bChecked) return 1;
				return a.localeCompare(b);
			});
	});

	function togglePack(pack: string) {
		if (selectedPacks.has(pack)) {
			selectedPacks.delete(pack);
		} else {
			selectedPacks.add(pack);
		}
	}

	function clearAll() {
		selectedPacks.clear();
		questionSearchQuery = '';
	}
</script>

<div
	class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm"
>
	<div class="flex items-center justify-between">
		<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Listening Sets</h4>
		{#if selectedPacks.size > 0 || questionSearchQuery.trim().length > 0}
			<button
				onclick={clearAll}
				class="text-xs text-brand-500 hover:underline font-medium cursor-pointer"
			>
				Clear filters
			</button>
		{/if}
	</div>

	<!-- Text Filter for Question Name / Prompt -->
	<label class="block space-y-1">
		<span class="text-[11px] font-semibold text-slate-600 dark:text-slate-400"
			>Search Question Name</span
		>
		<input
			type="text"
			placeholder="Search by question text..."
			bind:value={questionSearchQuery}
			class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
		/>
	</label>

	<!-- Pack / Collection Tag Filter -->
	<div class="space-y-2">
		<label class="block space-y-1">
			<span class="text-[11px] font-semibold text-slate-600 dark:text-slate-400"
				>Filter by Pack Tags</span
			>
			<input
				type="text"
				placeholder="Search pack collections..."
				bind:value={packSearchQuery}
				class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
			/>
		</label>

		{#if allPacks().length > 0}
			<div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
				{#each filteredAndSortedPacks() as pack (pack)}
					{@const isChecked = selectedPacks.has(pack)}
					<button
						onclick={() => togglePack(pack)}
						class={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
							isChecked
								? 'bg-brand-500 text-white shadow-sm'
								: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
						}`}
					>
						<span>📦 {pack}</span>
						{#if isChecked}
							<span class="text-[10px] bg-white/20 px-1 rounded">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
