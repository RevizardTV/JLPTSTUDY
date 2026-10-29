<script lang="ts">
	import { questionSets } from '#lib/stores.js';
	import type { QuestionSet, VocabItem } from '#lib/types.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { getExistingVocabSignatures, filterUniqueVocab } from '#lib/utils/vocabChecker.js';
	import { parseVocabTextToItems } from '#lib/utils/vocabTextParser.js';

	let { onclose }: { onclose: () => void } = $props();

	let targetSetId = $state<string>('standalone');
	let inputPayload = $state<string>('');
	let errorMessage = $state<string | null>(null);
	let successCount = $state<number | null>(null);
	let duplicateCount = $state<number>(0);
	let allDuplicatesNotice = $state<boolean>(false);

	const availableSets = $derived($questionSets as QuestionSet[]);

	const placeholderText = `Paste JSON array OR text format:
明日 (あした) [ashita] - tomorrow (noun, time, n5)
公園 (こうえん) [kouen] - park (noun, place, n5)
白い (しろい) [shiroi] - white (i-adjective, colour, n5)`;

	function handleUpload() {
		errorMessage = null;
		successCount = null;
		duplicateCount = 0;
		allDuplicatesNotice = false;

		const trimmed = inputPayload.trim();
		if (!trimmed) {
			errorMessage = 'Please provide a valid JSON array or text vocabulary list.';
			return;
		}

		try {
			let rawParsedVocab: VocabItem[] = [];

			// Try parsing as JSON first if it starts with [ or {
			if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
				const parsed: unknown = JSON.parse(trimmed);
				const rawArray = Array.isArray(parsed) ? parsed : [parsed];

				for (let i = 0; i < rawArray.length; i++) {
					const item = rawArray[i] as Record<string, unknown>;

					if (!item || typeof item !== 'object' || !item.word || !item.meaning) {
						throw new Error(`Item at index ${i} is missing required fields ("word" or "meaning").`);
					}

					const rawTags = item.vocabTags || item.tags;
					const vocabTags = Array.isArray(rawTags) ? rawTags.map((t) => String(t)) : [];

					rawParsedVocab.push({
						word: String(item.word),
						meaning: String(item.meaning),
						kana: typeof item.kana === 'string' ? item.kana : undefined,
						romaji: typeof item.romaji === 'string' ? item.romaji : undefined,
						vocabTags
					});
				}
			} else {
				// Otherwise parse as raw text vocabulary format
				rawParsedVocab = parseVocabTextToItems(trimmed);
				if (rawParsedVocab.length === 0) {
					throw new Error('Could not extract any valid vocabulary items from text.');
				}
			}

			questionSets.update((existing) => {
				const setMap = new SvelteMap<string, QuestionSet>(existing.map((s) => [s.id, s]));
				const existingSignatures = getExistingVocabSignatures(existing);

				const { uniqueVocab, skippedCount } = filterUniqueVocab(rawParsedVocab, existingSignatures);
				duplicateCount = skippedCount;

				if (uniqueVocab.length === 0 && rawParsedVocab.length > 0) {
					allDuplicatesNotice = true;
					return existing;
				}

				if (targetSetId === 'standalone' || !setMap.has(targetSetId)) {
					const standaloneId = `vocab-import-${Date.now()}`;
					const newSet: QuestionSet = {
						id: standaloneId,
						title: `Direct Vocab Import (${new Date().toLocaleDateString()})`,
						category: 'vocabulary',
						packTitle: 'Custom Vocab',
						tags: ['vocab', 'custom'],
						contextPassages: [],
						questions: [],
						vocab: uniqueVocab
					};
					setMap.set(standaloneId, newSet);
				} else {
					const existingSet = setMap.get(targetSetId)!;
					const updatedVocab = [...(existingSet.vocab || []), ...uniqueVocab];
					setMap.set(targetSetId, {
						...existingSet,
						vocab: updatedVocab
					});
				}

				const updated = Array.from(setMap.values());
				if (typeof window !== 'undefined') {
					localStorage.setItem('kanji_question_sets', JSON.stringify(updated));
				}

				successCount = uniqueVocab.length;
				return updated;
			});

			if (!allDuplicatesNotice) {
				setTimeout(() => {
					onclose();
				}, 1500);
			}
		} catch (e: unknown) {
			const errMsg = e instanceof Error ? e.message : 'Unknown error';
			errorMessage = `Import failed: ${errMsg}`;
		}
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			if (e.target?.result) {
				inputPayload = e.target.result as string;
			}
		};

		reader.readAsText(file);
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
	<div
		class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl p-6 shadow-2xl space-y-4"
	>
		<div
			class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3"
		>
			<div>
				<h3
					class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2"
				>
					<span>📖</span>
					<span>Direct Vocabulary Upload (JSON or Text)</span>
				</h3>
				<p class="text-xs text-slate-500">
					Automatically detects duplicates and supports raw line-by-line vocab lists.
				</p>
			</div>
			<button
				onclick={onclose}
				class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold px-2 py-1 rounded-lg"
			>
				✕
			</button>
		</div>

		{#if errorMessage}
			<div
				class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold"
			>
				{errorMessage}
			</div>
		{/if}

		{#if allDuplicatesNotice}
			<div
				class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-semibold space-y-1"
			>
				<div class="flex items-center space-x-2">
					<span>⚠️</span>
					<span
						>All items in this payload already exist in your vocabulary! No new items were imported.</span
					>
				</div>
			</div>
		{/if}

		{#if successCount !== null && successCount > 0}
			<div
				class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold space-y-1"
			>
				<div class="flex items-center space-x-2">
					<span>✓</span>
					<span
						>Successfully imported {successCount} new vocabulary item{successCount > 1
							? 's'
							: ''}!</span
					>
				</div>
				{#if duplicateCount > 0}
					<div class="text-slate-400 text-[11px] font-normal pl-4">
						Skipped {duplicateCount} duplicate item{duplicateCount > 1 ? 's' : ''} with matching kana.
					</div>
				{/if}
			</div>
		{/if}

		<div class="space-y-1">
			<label
				for="target-set-select"
				class="text-xs font-bold uppercase tracking-wider text-slate-400">Target Question Set</label
			>
			<select
				id="target-set-select"
				bind:value={targetSetId}
				class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
			>
				<option value="standalone">Create Standalone Vocab Package</option>
				{#each availableSets as set (set.id)}
					<option value={set.id}>Append to: {set.title} ({set.id})</option>
				{/each}
			</select>
		</div>

		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<label
					for="vocab-textarea"
					class="text-xs font-bold uppercase tracking-wider text-slate-400"
					>Payload (JSON or Raw Vocab List)</label
				>
				<label class="text-xs text-brand-500 hover:underline cursor-pointer font-medium">
					<span>📁 Select .json or .txt file</span>
					<input type="file" accept=".json,.txt" onchange={handleFileUpload} class="hidden" />
				</label>
			</div>

			<textarea
				id="vocab-textarea"
				bind:value={inputPayload}
				placeholder={placeholderText}
				class="w-full h-48 p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
			></textarea>
		</div>

		<div class="flex justify-end space-x-3 pt-2">
			<button
				onclick={onclose}
				class="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition"
			>
				Cancel
			</button>
			<button
				onclick={handleUpload}
				class="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow transition"
			>
				Upload Vocab
			</button>
		</div>
	</div>
</div>
