<script lang="ts">
	import KanaFilterModal from '#lib/components/modals/KanaFilterModal.svelte';

	let {
		kanjiQuery = $bindable(''),
		kanaQuery = $bindable(''),
		englishQuery = $bindable(''),
		selectedKana = $bindable(''),
		onupload,
		oneraseall
	}: {
		kanjiQuery: string;
		kanaQuery: string;
		englishQuery: string;
		selectedKana?: string;
		onupload?: () => void;
		oneraseall?: () => void;
	} = $props();

	let showKanaModal = $state(false);
</script>

<div
	class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		<input
			type="text"
			bind:value={kanjiQuery}
			placeholder="Filter by Kanji..."
			class="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
		/>
		<input
			type="text"
			bind:value={kanaQuery}
			placeholder="Filter by Kana..."
			class="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
		/>
		<input
			type="text"
			bind:value={englishQuery}
			placeholder="Filter by English meaning..."
			class="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
		/>
	</div>

	<div
		class="flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2"
	>
		<!-- Kana Grid Picker Trigger Button -->
		<button
			onclick={() => (showKanaModal = true)}
			class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
		>
			<span>あ</span>
			<span>{selectedKana ? `Kana: ${selectedKana}` : 'Filter by Starting Kana'}</span>
			{#if selectedKana}
				<span
					role="button"
					tabindex="0"
					onclick={(e) => {
						e.stopPropagation();
						selectedKana = '';
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.stopPropagation();
							selectedKana = '';
						}
					}}
					class="ml-1 text-[10px] hover:text-rose-500 cursor-pointer">✕</span
				>
			{/if}
		</button>

		<div class="flex items-center gap-2">
			{#if onupload}
				<button
					onclick={onupload}
					class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow transition"
				>
					Batch Upload
				</button>
			{/if}
			{#if oneraseall}
				<button
					onclick={oneraseall}
					class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold transition"
				>
					Erase All
				</button>
			{/if}
		</div>
	</div>
</div>

<KanaFilterModal
	isOpen={showKanaModal}
	{selectedKana}
	onSelect={(k) => (selectedKana = k)}
	onClose={() => (showKanaModal = false)}
/>
