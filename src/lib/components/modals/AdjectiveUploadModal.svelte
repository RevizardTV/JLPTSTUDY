<script lang="ts">
	import { parseAdjectiveTextToItems } from '#lib/utils/adjectiveTextParser.js';
	import type { AdjItem } from '#lib/types/grammar.js';

	let {
		onclose,
		onuploadsuccess
	}: { onclose: () => void; onuploadsuccess: (items: AdjItem[]) => void } = $props();

	let activeTab = $state<'json' | 'text'>('text');
	let rawInput = $state<string>('');

	function handleUpload() {
		try {
			let parsedItems: AdjItem[] = [];
			if (activeTab === 'json') {
				parsedItems = JSON.parse(rawInput) as AdjItem[];
			} else {
				parsedItems = parseAdjectiveTextToItems(rawInput);
			}

			if (Array.isArray(parsedItems) && parsedItems.length > 0) {
				onuploadsuccess(parsedItems);
				alert(`Successfully loaded ${parsedItems.length} adjectives!`);
				onclose();
			} else {
				alert('No valid items found in input.');
			}
		} catch {
			alert('Failed to parse input. Please check your format.');
		}
	}
</script>

<div
	class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
>
	<div
		class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
	>
		<div class="flex justify-between items-center">
			<h3 class="font-bold text-lg text-slate-900 dark:text-slate-100">Batch Upload Adjectives</h3>
			<button onclick={onclose} class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
		</div>

		<!-- Format Tabs -->
		<div class="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
			<button
				onclick={() => (activeTab = 'text')}
				class={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'text' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
			>
				Plain Text Format
			</button>
			<button
				onclick={() => (activeTab = 'json')}
				class={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'json' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
			>
				JSON Format
			</button>
		</div>

		{#if activeTab === 'text'}
			<p class="text-xs text-slate-400">
				Format: <code class="text-purple-500 font-mono"
					>大きい (おおきい) [ookii] - big (i-adj, n5)</code
				>
			</p>
		{:else}
			<p class="text-xs text-slate-400">Paste raw JSON array of adjective objects.</p>
		{/if}

		<textarea
			bind:value={rawInput}
			rows="7"
			placeholder={activeTab === 'text'
				? '大きい (おおきい) [ookii] - big (i-adj, n5)\n静か (しずか) [shizuka] - quiet (na-adj, n5)'
				: '[\n  { "dictionary": "大きい", "reading": "おおきい", ... \n}]'}
			class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono outline-none text-slate-800 dark:text-slate-200"
		></textarea>

		<div class="flex justify-end gap-2">
			<button
				onclick={onclose}
				class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
				>Cancel</button
			>
			<button
				onclick={handleUpload}
				class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow"
				>Process & Upload</button
			>
		</div>
	</div>
</div>
