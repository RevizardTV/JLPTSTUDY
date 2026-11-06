<script lang="ts">
	import type { VerbItem } from '#lib/types/grammar.js';
	import GrammarFilterBar from '#lib/components/grammar/GrammarFilterBar.svelte';
	import AccordionCard from '#lib/components/grammar/AccordionCard.svelte';
	import VerbUploadModal from '#lib/components/modals/VerbUploadModal.svelte';
	import { filterRedundantVerbs } from '#lib/utils/redundancyChecker.js';
	import { verbStore } from '#lib/stores.js';

	let kanjiQuery = $state<string>('');
	let kanaQuery = $state<string>('');
	let englishQuery = $state<string>('');
	let selectedKana = $state<string>('');
	let selectedGroup = $state<string>('all'); // 'all', '1', '2', or '3'
	let showModal = $state<boolean>(false);

	let verbList = $state<VerbItem[]>([]);
	$effect(() => {
		const unsubscribe = verbStore.subscribe((value) => {
			verbList = value;
		});
		return unsubscribe;
	});

	function handleNewVerbs(newItems: VerbItem[]) {
		const { uniqueItems, skippedCount } = filterRedundantVerbs(verbList, newItems);

		if (uniqueItems.length > 0) {
			verbStore.update((curr) => [...uniqueItems, ...curr]);
			alert(
				`Successfully added ${uniqueItems.length} new verb(s). ${skippedCount > 0 ? `(${skippedCount} redundant items skipped)` : ''}`
			);
		} else {
			alert(`Upload skipped: All ${newItems.length} verb(s) already exist.`);
		}
	}

	function handleEraseAll() {
		if (confirm('Are you sure you want to erase all verbs?')) {
			verbStore.set([]);
		}
	}

	const filteredVerbs = $derived(
		verbList.filter((verb) => {
			const mKanji = !kanjiQuery.trim() || verb.dictionary.includes(kanjiQuery.trim());
			const mKana = !kanaQuery.trim() || verb.reading.includes(kanaQuery.trim());
			const mEng =
				!englishQuery.trim() ||
				verb.english.toLowerCase().includes(englishQuery.trim().toLowerCase());
			const mStartingKana = !selectedKana || verb.reading.startsWith(selectedKana);
			const mGroup = selectedGroup === 'all' || verb.group.toString() === selectedGroup;

			return mKanji && mKana && mEng && mStartingKana && mGroup;
		})
	);
</script>

<div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
	<!-- Hero Header -->
	<div
		class="relative overflow-hidden rounded-2xl bg-linear-to-r from-brand-600 to-indigo-600 text-white p-6 sm:p-8 shadow-xl"
	>
		<span
			class="inline-block px-3 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-semibold mb-3"
			>JLPT N5-N4 Grammar</span
		>
		<h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Verb Conjugation Explorer</h2>
		<p class="text-indigo-100 text-sm">
			Explore Group 1, Group 2, and Group 3 verbs across polite tenses, te-forms, potential, and
			volitional forms.
		</p>
	</div>

	<!-- Filter Bar with Group Selector Tabs -->
	<div class="space-y-4">
		<GrammarFilterBar
			bind:kanjiQuery
			bind:kanaQuery
			bind:englishQuery
			bind:selectedKana
			onupload={() => (showModal = true)}
			oneraseall={handleEraseAll}
		/>

		<!-- Verb Group Filter Toggle -->
		<div
			class="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
		>
			<span class="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Group:</span>
			<button
				type="button"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {selectedGroup === 'all'
					? 'bg-brand-600 text-white'
					: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
				onclick={() => (selectedGroup = 'all')}
			>
				All Groups
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {selectedGroup === '1'
					? 'bg-brand-600 text-white'
					: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
				onclick={() => (selectedGroup = '1')}
			>
				Group 1 (Godan)
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {selectedGroup === '2'
					? 'bg-brand-600 text-white'
					: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
				onclick={() => (selectedGroup = '2')}
			>
				Group 2 (Ichidan)
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {selectedGroup === '3'
					? 'bg-brand-600 text-white'
					: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
				onclick={() => (selectedGroup = '3')}
			>
				Group 3 (Irregular)
			</button>
		</div>
	</div>

	<!-- Verb Accordion Boxes List -->
	<div class="space-y-4">
		{#each filteredVerbs as verb (verb.id)}
			<AccordionCard
				title="{verb.dictionary} ({verb.reading})"
				subtitle={verb.english}
				badge="Group {verb.group}"
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each Object.entries(verb.forms) as [key, form] (key)}
						<div
							class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-xs"
						>
							<span class="text-[10px] font-bold uppercase tracking-wider text-brand-500"
								>{form.formName}</span
							>
							<div class="text-xl font-bold font-japanese text-slate-800 dark:text-slate-100">
								{form.kanji}
							</div>
							<div class="text-xs font-japanese text-slate-400">Kana: {form.kana}</div>
							<div
								class="text-xs italic text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50"
							>
								{form.romaji} — <strong>{form.english}</strong>
							</div>
						</div>
					{/each}
				</div>
			</AccordionCard>
		{:else}
			<div
				class="py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
			>
				{verbList.length === 0
					? 'Your verb list is empty. Upload text or JSON to populate.'
					: 'No verbs match your filters.'}
			</div>
		{/each}
	</div>

	{#if showModal}
		<VerbUploadModal onclose={() => (showModal = false)} onuploadsuccess={handleNewVerbs} />
	{/if}
</div>
