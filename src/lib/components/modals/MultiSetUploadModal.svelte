<script lang="ts">
	import { questionSets } from '#lib/stores.js';
	import type { QuestionSet } from '#lib/types.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { getExistingVocabSignatures, filterUniqueVocab } from '#lib/utils/vocabChecker.js';
	import { parseGrammarTextToSets } from '#lib/utils/textParser.ts'; // Import utility

	let { onclose }: { onclose: () => void } = $props();

	let inputPayload = $state('');
	let errorMessage = $state<string | null>(null);
	let successCount = $state<number | null>(null);
	let skippedVocabCount = $state<number>(0);

	function handleUpload() {
		errorMessage = null;
		successCount = null;
		skippedVocabCount = 0;

		const trimmed = inputPayload.trim();
		if (!trimmed) {
			errorMessage = 'Please paste a valid JSON array or structured text format.';
			return;
		}

		let validSets: QuestionSet[] = [];

		try {
			// Try parsing as JSON first
			if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
				const parsed: unknown = JSON.parse(trimmed);
				const rawArray = Array.isArray(parsed) ? parsed : [parsed];

				for (let i = 0; i < rawArray.length; i++) {
					const item = rawArray[i] as Record<string, unknown>;
					if (
						!item ||
						typeof item !== 'object' ||
						!item.id ||
						!item.title ||
						!item.category ||
						!Array.isArray(item.questions)
					) {
						throw new Error(`Set at index ${i} is missing required fields.`);
					}
					validSets.push({
						id: String(item.id),
						title: String(item.title),
						category: String(item.category),
						packTitle: typeof item.packTitle === 'string' ? item.packTitle : undefined,
						tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
						contextPassages: Array.isArray(item.contextPassages)
							? item.contextPassages.map(String)
							: [],
						contextEnglish: Array.isArray(item.contextEnglish)
							? item.contextEnglish.map(String)
							: undefined,
						questions: item.questions as QuestionSet['questions'],
						vocab: Array.isArray(item.vocab) ? (item.vocab as QuestionSet['vocab']) : []
					});
				}
			} else {
				// Otherwise, process as raw text grammar format using our frontend utility
				validSets = parseGrammarTextToSets(trimmed);
				if (validSets.length === 0) {
					throw new Error('Could not parse any valid sets from the provided text.');
				}
			}

			questionSets.update((existing) => {
				const setMap = new SvelteMap<string, QuestionSet>(existing.map((s) => [s.id, s]));
				const existingSignatures = getExistingVocabSignatures(existing);

				validSets.forEach((newSet, index) => {
					let finalId = newSet.id;
					if (setMap.has(finalId)) {
						finalId = `${newSet.id}-${Date.now()}-${index}`;
						newSet = { ...newSet, id: finalId };
					}

					if (newSet.vocab && newSet.vocab.length > 0) {
						const { uniqueVocab, skippedCount } = filterUniqueVocab(
							newSet.vocab,
							existingSignatures
						);
						newSet.vocab = uniqueVocab;
						skippedVocabCount += skippedCount;
					}
					setMap.set(newSet.id, newSet);
				});

				const updated = Array.from(setMap.values());
				if (typeof window !== 'undefined') {
					localStorage.setItem('kanji_question_sets', JSON.stringify(updated));
				}

				return updated;
			});

			successCount = validSets.length;
			setTimeout(() => {
				onclose();
			}, 1500);
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
	const placeholderText = `Paste JSON array OR text format:
---
SetId: set-1
Title: Set 1
ContextPassages: 毎日... | 京都...
ContextEnglish: Every day... | Kyoto...
1. Prompt
   1) Option - meaning
Answer Key:
1. 1`;
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
	<div
		class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl p-6 shadow-2xl space-y-4"
	>
		<div
			class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3"
		>
			<div>
				<h3
					class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2"
				>
					<span>📦</span>
					<span>Upload Multiple Question Sets (JSON or Text)</span>
				</h3>
				<p class="text-xs text-slate-500">
					Paste JSON or raw exercise text files directly to batch import sets
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

		{#if successCount !== null}
			<div
				class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold space-y-1"
			>
				<div class="flex items-center space-x-2">
					<span>✓</span>
					<span
						>Successfully imported {successCount} question set{successCount > 1 ? 's' : ''}!</span
					>
				</div>
				{#if skippedVocabCount > 0}
					<div class="text-slate-400 text-[11px] font-normal pl-4">
						Skipped {skippedVocabCount} duplicate vocabulary item{skippedVocabCount > 1 ? 's' : ''} already
						present.
					</div>
				{/if}
			</div>
		{/if}

		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<label
					for="payload-textarea"
					class="text-xs font-bold uppercase tracking-wider text-slate-400"
					>Payload (JSON or Raw Text Format)</label
				>
				<label class="text-xs text-brand-500 hover:underline cursor-pointer font-medium">
					<span>📁 Select .json or .txt file</span>
					<input type="file" accept=".json,.txt" onchange={handleFileUpload} class="hidden" />
				</label>
			</div>

			<textarea
				id="payload-textarea"
				bind:value={inputPayload}
				placeholder={placeholderText}
				class="w-full h-64 p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
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
				Import Sets
			</button>
		</div>
	</div>
</div>
