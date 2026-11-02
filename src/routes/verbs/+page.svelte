<script lang="ts">
	import type { VerbItem } from '#lib/types/grammar.js';
	import GrammarFilterBar from '#lib/components/grammar/GrammarFilterBar.svelte';
	import AccordionCard from '#lib/components/grammar/AccordionCard.svelte';
	import VerbUploadModal from '#lib/components/modals/VerbUploadModal.svelte';
	import { filterRedundantVerbs } from '#lib/utils/redundancyChecker.js';

	let kanjiQuery = $state<string>('');
	let kanaQuery = $state<string>('');
	let englishQuery = $state<string>('');
	let showModal = $state<boolean>(false);

	let verbList = $state<VerbItem[]>([
		{
			id: 'taberu',
			group: 2,
			dictionary: '食べる',
			reading: 'たべる',
			english: 'to eat',
			forms: {
				masu: {
					formName: 'Masu (Polite Non-Past)',
					kanji: '食べます',
					kana: 'たべます',
					romaji: 'tabemasu',
					english: 'eat / will eat'
				},
				masen: {
					formName: 'Masen (Polite Negative)',
					kanji: '食べません',
					kana: 'たべません',
					romaji: 'tabemasen',
					english: 'do not eat'
				},
				mashita: {
					formName: 'Mashita (Polite Past)',
					kanji: '食べました',
					kana: 'たべました',
					romaji: 'tabemashita',
					english: 'ate'
				},
				te: {
					formName: 'Te-Form (Connection)',
					kanji: '食べて',
					kana: 'たべて',
					romaji: 'tabete',
					english: 'eating and...'
				},
				potential: {
					formName: 'Potential Form',
					kanji: '食べられる',
					kana: 'たべられる',
					romaji: 'taberareru',
					english: 'can eat'
				},
				volitional: {
					formName: 'Volitional Form',
					kanji: '食べよう',
					kana: 'たべよう',
					romaji: 'tabeyou',
					english: "let's eat"
				},
				imperative: {
					formName: 'Imperative Form',
					kanji: '食べろ',
					kana: 'たべろ',
					romaji: 'tabero',
					english: 'Eat!'
				}
			}
		}
	]);

	function handleNewVerbs(newItems: VerbItem[]) {
		const { uniqueItems, skippedCount } = filterRedundantVerbs(verbList, newItems);

		if (uniqueItems.length > 0) {
			verbList = [...uniqueItems, ...verbList];
			alert(
				`Successfully added ${uniqueItems.length} new verb(s). ${skippedCount > 0 ? `(${skippedCount} redundant items skipped)` : ''}`
			);
		} else {
			alert(`Upload skipped: All ${newItems.length} verb(s) already exist.`);
		}
	}

	function handleEraseAll() {
		if (confirm('Are you sure you want to erase all verbs?')) {
			verbList = [];
		}
	}

	const filteredVerbs = $derived(
		verbList.filter((v) => {
			const mKanji = !kanjiQuery.trim() || v.dictionary.includes(kanjiQuery.trim());
			const mKana = !kanaQuery.trim() || v.reading.includes(kanaQuery.trim());
			const mEng =
				!englishQuery.trim() || v.english.toLowerCase().includes(englishQuery.trim().toLowerCase());
			return mKanji && mKana && mEng;
		})
	);
</script>

<div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
	<div
		class="relative overflow-hidden rounded-2xl bg-linear-to-r from-brand-600 to-rose-500 text-white p-6 sm:p-8 shadow-xl"
	>
		<span
			class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3"
			>JLTP N5-N4 Grammar</span
		>
		<h2 class="text-2xl sm:text-3xl font-extrabold mb-2">
			Comprehensive Verb Conjugation Explorer
		</h2>
		<p class="text-rose-100 text-sm">
			Covering all polite forms, past tenses, te-forms, potential, volitional, and imperatives.
		</p>
	</div>

	<GrammarFilterBar
		bind:kanjiQuery
		bind:kanaQuery
		bind:englishQuery
		onupload={() => (showModal = true)}
		oneraseall={handleEraseAll}
	/>

	<div class="space-y-4">
		{#each filteredVerbs as verb (verb.id)}
			<AccordionCard
				title="{verb.dictionary} ({verb.reading})"
				subtitle={verb.english}
				badge="Group {verb.group} Verb"
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
