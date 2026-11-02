<script lang="ts">
	let {
		kanjiQuery = $bindable(''),
		kanaQuery = $bindable(''),
		englishQuery = $bindable(''),
		onupload,
		oneraseall
	}: {
		kanjiQuery: string;
		kanaQuery: string;
		englishQuery: string;
		onupload: () => void;
		oneraseall?: () => void;
	} = $props();
</script>

<div
	class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
>
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
		<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Search & Filter</span>
		<div class="flex items-center space-x-2">
			{#if oneraseall}
				<button
					onclick={oneraseall}
					class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition"
				>
					🗑️ Erase All Verbs
				</button>
			{/if}
			<button
				onclick={onupload}
				class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow transition"
			>
				+ Upload Batch JSON/Text
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		<div class="space-y-1">
			<label for="kanji-search" class="text-[10px] font-bold uppercase text-slate-400">Kanji</label>
			<input
				id="kanji-search"
				type="text"
				bind:value={kanjiQuery}
				placeholder="Search Kanji..."
				class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
			/>
		</div>

		<div class="space-y-1">
			<label for="kana-search" class="text-[10px] font-bold uppercase text-slate-400">Kana</label>
			<input
				id="kana-search"
				type="text"
				bind:value={kanaQuery}
				placeholder="Search Kana..."
				class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
			/>
		</div>

		<div class="space-y-1">
			<label for="english-search" class="text-[10px] font-bold uppercase text-slate-400"
				>English Meaning</label
			>
			<input
				id="english-search"
				type="text"
				bind:value={englishQuery}
				placeholder="Search English..."
				class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
			/>
		</div>
	</div>
</div>
