<script lang="ts">
	interface ParsedVocabItem {
		kanji: string;
		kana: string;
		romaji: string;
		meaning: string;
		vocabTags?: string[];
	}

	let { item }: { item: ParsedVocabItem } = $props();
</script>

<div
	class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 transition hover:shadow-md"
>
	<!-- Top section: Word & Tags with safe flex spacing to prevent overlapping -->
	<div class="flex items-start justify-between gap-3">
		<!-- Vocabulary Word (shrinks/wraps gracefully without touching tags) -->
		<div class="min-w-0 flex-1 space-y-2">
			<div
				class="text-2xl font-bold font-japanese text-brand-600 dark:text-brand-400 wrap-break-word leading-tight"
			>
				{item.kanji}
			</div>

			<div
				class="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-japanese text-xs rounded-lg border border-slate-200 dark:border-slate-600"
			>
				<span class="text-slate-400 text-[10px] font-sans">Kana:</span>
				<span class="font-bold text-brand-500">{item.kana}</span>
			</div>
		</div>

		<!-- Tags Column (fixed alignment, will never overlap the word) -->
		{#if item.vocabTags && item.vocabTags.length > 0}
			<div class="flex flex-wrap justify-end gap-1 max-w-35 shrink-0">
				{#each item.vocabTags as tag (tag)}
					<span
						class="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20 capitalize font-medium"
					>
						#{tag}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Bottom section: Meaning & Romaji -->
	<div
		class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs"
	>
		<span class="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Meaning</span>
		<span class="font-semibold text-slate-700 dark:text-slate-200 text-right">
			{item.meaning}
			{#if item.romaji}
				<span class="text-slate-400 font-normal ml-1">({item.romaji})</span>
			{/if}
		</span>
	</div>
</div>
