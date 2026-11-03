<script lang="ts">
	import type { AdjItem } from '#lib/types/grammar.js';
	import GrammarFilterBar from '#lib/components/grammar/GrammarFilterBar.svelte';
	import AccordionCard from '#lib/components/grammar/AccordionCard.svelte';
	import AdjectiveUploadModal from '#lib/components/modals/AdjectiveUploadModal.svelte';
	import { filterRedundantAdjectives } from '#lib/utils/redundancyChecker.js';

	let kanjiQuery = $state<string>('');
	let kanaQuery = $state<string>('');
	let englishQuery = $state<string>('');
	let selectedKana = $state<string>('');
	let showModal = $state<boolean>(false);

	let adjectiveList = $state<AdjItem[]>([
		{
			id: 'ookii',
			category: 'i-adj',
			dictionary: '大きい',
			reading: 'おおきい',
			english: 'big',
			forms: {
				nonPast: {
					formName: 'Non-Past Polite',
					kanji: '大きいです',
					kana: 'おおきいです',
					romaji: 'ookii desu',
					english: 'is big'
				},
				past: {
					formName: 'Past Polite',
					kanji: '大きかったです',
					kana: 'おおきかったです',
					romaji: 'ookikatta desu',
					english: 'was big'
				},
				negative: {
					formName: 'Negative Polite',
					kanji: '大きくないです',
					kana: 'おおきくないです',
					romaji: 'ookikunai desu',
					english: 'is not big'
				},
				pastNegative: {
					formName: 'Past Negative Polite',
					kanji: '大きくなかったです',
					kana: 'おおきくなかったです',
					romaji: 'ookikunakatta desu',
					english: 'was not big'
				},
				adverbial: {
					formName: 'Adverbial Form (ku-form)',
					kanji: '大きく',
					kana: 'おおきく',
					romaji: 'ookiku',
					english: 'big (adverb)'
				},
				attributive: {
					formName: 'Attributive Form',
					kanji: '大きい',
					kana: 'おおきい',
					romaji: 'ookii',
					english: 'big (base form)'
				}
			}
		}
	]);

	function handleNewAdjectives(newItems: AdjItem[]) {
		const { uniqueItems, skippedCount } = filterRedundantAdjectives(adjectiveList, newItems);

		if (uniqueItems.length > 0) {
			adjectiveList = [...uniqueItems, ...adjectiveList];
			alert(
				`Successfully added ${uniqueItems.length} new adjective(s). ${skippedCount > 0 ? `(${skippedCount} redundant items skipped)` : ''}`
			);
		} else {
			alert(`Upload skipped: All ${newItems.length} adjective(s) already exist.`);
		}
	}

	function handleEraseAll() {
		if (confirm('Are you sure you want to erase all adjectives?')) {
			adjectiveList = [];
		}
	}

	const filteredAdjectives = $derived(
		adjectiveList.filter((adj) => {
			const mKanji = !kanjiQuery.trim() || adj.dictionary.includes(kanjiQuery.trim());
			const mKana = !kanaQuery.trim() || adj.reading.includes(kanaQuery.trim());
			const mEng =
				!englishQuery.trim() ||
				adj.english.toLowerCase().includes(englishQuery.trim().toLowerCase());
			const mStartingKana = !selectedKana || adj.reading.startsWith(selectedKana);

			return mKanji && mKana && mEng && mStartingKana;
		})
	);
</script>

<div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
	<!-- Hero Header -->
	<div
		class="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white p-6 sm:p-8 shadow-xl"
	>
		<span
			class="inline-block px-3 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-semibold mb-3"
			>JLPT N5-N4 Grammar</span
		>
		<h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Adjective Conjugation Explorer</h2>
		<p class="text-indigo-100 text-sm">
			Explore I-Adjectives, Na-Adjectives, past tenses, negatives, and adverbial ku/ni forms.
		</p>
	</div>

	<!-- Filter Bar with Kana Filter Binding -->
	<GrammarFilterBar
		bind:kanjiQuery
		bind:kanaQuery
		bind:englishQuery
		bind:selectedKana
		onupload={() => (showModal = true)}
		oneraseall={handleEraseAll}
	/>

	<!-- Adjective Accordion Boxes List -->
	<div class="space-y-4">
		{#each filteredAdjectives as adj (adj.id)}
			<AccordionCard
				title="{adj.dictionary} ({adj.reading})"
				subtitle={adj.english}
				badge={adj.category}
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each Object.entries(adj.forms) as [key, form] (key)}
						<div
							class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-xs"
						>
							<span class="text-[10px] font-bold uppercase tracking-wider text-purple-500"
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
				{adjectiveList.length === 0
					? 'Your adjective list is empty. Upload text or JSON to populate.'
					: 'No adjectives match your filters.'}
			</div>
		{/each}
	</div>

	{#if showModal}
		<AdjectiveUploadModal
			onclose={() => (showModal = false)}
			onuploadsuccess={handleNewAdjectives}
		/>
	{/if}
</div>
