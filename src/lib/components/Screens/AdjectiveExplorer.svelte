<script lang="ts">
	import type { AdjItem } from '#lib/types/grammar.js';

	let adjList: AdjItem[] = $state([
		{
			id: 'takai',
			dictionary: '高い',
			reading: 'たかい',
			english: 'expensive / tall',
			category: 'i-adj',
			forms: {
				nonPastAff: {
					formName: 'Non-Past Affirmative',
					kanji: '高いです',
					kana: 'たかいです',
					romaji: 'takai desu',
					english: 'is expensive'
				},
				nonPastNeg: {
					formName: 'Non-Past Negative',
					kanji: '高くないです',
					kana: 'たかくないです',
					romaji: 'takakunai desu',
					english: 'is not expensive'
				},
				pastAff: {
					formName: 'Past Affirmative',
					kanji: '高かったです',
					kana: 'たかかったです',
					romaji: 'takakatta desu',
					english: 'was expensive'
				},
				pastNeg: {
					formName: 'Past Negative',
					kanji: '高くなかったです',
					kana: 'たかくなかったです',
					romaji: 'takakunakatta desu',
					english: 'was not expensive'
				},
				modifying: {
					formName: 'Noun Modifying',
					kanji: '高い山',
					kana: 'たかいやま',
					romaji: 'takai yama',
					english: 'expensive/high mountain'
				},
				teForm: {
					formName: 'Connecting (~kute)',
					kanji: '高くて',
					kana: 'たかくて',
					romaji: 'takakute',
					english: 'is expensive and...'
				},
				naru: {
					formName: 'Becoming (~naru)',
					kanji: '高くなります',
					kana: 'たかくなります',
					romaji: 'takaku narimasu',
					english: 'becomes expensive'
				}
			}
		},
		{
			id: 'shinsetsu',
			dictionary: '親切 [な]',
			reading: 'しんせつ',
			english: 'kind / helpful',
			category: 'na-adj',
			forms: {
				nonPastAff: {
					formName: 'Non-Past Affirmative',
					kanji: '親切です',
					kana: 'しんせつです',
					romaji: 'shinsetsu desu',
					english: 'is kind'
				},
				nonPastNeg: {
					formName: 'Non-Past Negative',
					kanji: '親切じゃありません',
					kana: 'しんせつじゃありません',
					romaji: 'shinsetsu ja arimasen',
					english: 'is not kind'
				},
				pastAff: {
					formName: 'Past Affirmative',
					kanji: '親切でした',
					kana: 'しんせつでした',
					romaji: 'shinsetsu deshita',
					english: 'was kind'
				},
				pastNeg: {
					formName: 'Past Negative',
					kanji: '親切じゃありませんでした',
					kana: 'しんせつじゃありませんでした',
					romaji: 'shinsetsu ja arimasen deshita',
					english: 'was not kind'
				},
				modifying: {
					formName: 'Noun Modifying',
					kanji: '親切な先生',
					kana: 'しんせつなせんせい',
					romaji: 'shinsetsu na sensei',
					english: 'kind teacher'
				},
				teForm: {
					formName: 'Connecting (~de)',
					kanji: '親切で',
					kana: 'しんせつで',
					romaji: 'shinsetsu de',
					english: 'is kind and...'
				},
				naru: {
					formName: 'Becoming (~naru)',
					kanji: '親切になります',
					kana: 'しんせつになります',
					romaji: 'shinsetsu ni narimasu',
					english: 'becomes kind'
				}
			}
		}
	]);

	let activeCategory = $state<string>('all');
	let activeAdjId = $state<string>('takai');

	let filteredAdjs = $derived(
		activeCategory === 'all' ? adjList : adjList.filter((a) => a.category === activeCategory)
	);

	let activeAdj = $derived(adjList.find((a) => a.id === activeAdjId) || adjList[0]);
</script>

<div class="space-y-6">
	<div class="bg-linear-to-r from-rose-500 to-amber-500 text-white p-6 rounded-2xl shadow-lg">
		<h2 class="text-2xl font-extrabold mb-1">🎨 JLPT N5 Adjective Explorer</h2>
		<p class="text-rose-100 text-sm">
			Compare い-adjectives and な-adjectives across all non-past, past, negative, and modifier
			forms.
		</p>
	</div>

	<div
		class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3"
	>
		<div class="flex items-center space-x-2">
			<span class="text-xs font-bold text-slate-400 uppercase">Category:</span>
			{#each ['all', 'i-adj', 'na-adj'] as cat (cat)}
				<button
					onclick={() => (activeCategory = cat)}
					class="px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize {activeCategory ===
					cat
						? 'bg-rose-500 text-white shadow-sm'
						: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
				>
					{cat === 'all' ? 'All' : cat}
				</button>
			{/each}
		</div>

		<div class="flex items-center space-x-2">
			<span class="text-xs font-bold text-slate-400 uppercase">Select Word:</span>
			<select
				bind:value={activeAdjId}
				class="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
			>
				{#each filteredAdjs as a (a.id)}
					<option value={a.id}>{a.dictionary} ({a.reading}) - {a.english}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if activeAdj}
		<div
			class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
		>
			<div>
				<span
					class="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-full uppercase"
				>
					{activeAdj.category}
				</span>
				<h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
					{activeAdj.dictionary}
					<span class="text-base font-medium text-slate-400">({activeAdj.reading})</span>
				</h3>
				<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{activeAdj.english}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each Object.entries(activeAdj.forms) as [key, form] (key)}
				<div
					class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-rose-500 transition space-y-2"
				>
					<div class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
						{form.formName}
					</div>

					<div class="space-y-0.5">
						<div class="text-xl font-bold text-slate-800 dark:text-slate-100">
							{form.kanji}
						</div>
						<div class="text-xs text-brand-500 font-medium">
							かな: {form.kana}
						</div>
						<div class="text-xs text-slate-400 italic">
							romaji: {form.romaji}
						</div>
					</div>

					<div
						class="pt-2 border-t border-slate-100 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300"
					>
						💬 {form.english}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
