<script lang="ts">
	import type { VerbItem } from '#lib/types/grammar.js';

	let verbList: VerbItem[] = $state([
		{
			id: 'taberu',
			dictionary: '食べる',
			reading: 'たべる',
			english: 'to eat',
			group: 2,
			forms: {
				masu: {
					formName: 'Masu Form (Polite Non-Past)',
					kanji: '食べます',
					kana: 'たべます',
					romaji: 'tabemasu',
					english: 'eat / will eat'
				},
				masen: {
					formName: 'Masen Form (Polite Negative)',
					kanji: '食べません',
					kana: 'たべません',
					romaji: 'tabemasen',
					english: 'do not eat'
				},
				te: {
					formName: 'Te-Form (Connection)',
					kanji: '食べて',
					kana: 'たべて',
					romaji: 'tabete',
					english: 'eating / and...'
				},
				teKudasai: {
					formName: 'Te-Kudasai (Request)',
					kanji: '食べてください',
					kana: 'たべてください',
					romaji: 'tabete kudasai',
					english: 'please eat'
				},
				teImasu: {
					formName: 'Te-Imasu (Progressive)',
					kanji: '食べています',
					kana: 'たべています',
					romaji: 'tabete imasu',
					english: 'is currently eating'
				},
				tai: {
					formName: 'Tai-Form (Desire)',
					kanji: '食べたいです',
					kana: 'たべたいです',
					romaji: 'tabetai desu',
					english: 'want to eat'
				},
				nakereba: {
					formName: 'Must Do (Obligation)',
					kanji: '食べなければなりません',
					kana: 'たべなければなりません',
					romaji: 'tabenakereba narimasen',
					english: 'must eat'
				},
				taKotoGaAru: {
					formName: 'Ta-Koto-Ga-Aru (Experience)',
					kanji: '食べたことがあります',
					kana: 'たべたことがあります',
					romaji: 'tabeta koto ga arimasu',
					english: 'have eaten before'
				}
			}
		},
		{
			id: 'nomu',
			dictionary: '飲む',
			reading: 'のむ',
			english: 'to drink',
			group: 1,
			forms: {
				masu: {
					formName: 'Masu Form (Polite Non-Past)',
					kanji: '飲みます',
					kana: 'のみます',
					romaji: 'nomimasu',
					english: 'drink / will drink'
				},
				masen: {
					formName: 'Masen Form (Polite Negative)',
					kanji: '飲みません',
					kana: 'のみません',
					romaji: 'nomimansen',
					english: 'do not drink'
				},
				te: {
					formName: 'Te-Form (Connection)',
					kanji: '飲んで',
					kana: 'のんで',
					romaji: 'nonde',
					english: 'drinking / and...'
				},
				teKudasai: {
					formName: 'Te-Kudasai (Request)',
					kanji: '飲んでください',
					kana: 'のんでください',
					romaji: 'nonde kudasai',
					english: 'please drink'
				},
				teImasu: {
					formName: 'Te-Imasu (Progressive)',
					kanji: '飲んでいます',
					kana: 'のんでいます',
					romaji: 'nonde imasu',
					english: 'is currently drinking'
				},
				tai: {
					formName: 'Tai-Form (Desire)',
					kanji: '飲みたいです',
					kana: 'のみたいです',
					romaji: 'nomitai desu',
					english: 'want to drink'
				},
				nakereba: {
					formName: 'Must Do (Obligation)',
					kanji: '飲まなければなりません',
					kana: 'のまなければなりません',
					romaji: 'nomanakereba narimasen',
					english: 'must drink'
				},
				taKotoGaAru: {
					formName: 'Ta-Koto-Ga-Aru (Experience)',
					kanji: '飲んだことがあります',
					kana: 'のんだことがあります',
					romaji: 'nonda koto ga arimasu',
					english: 'have drunk before'
				}
			}
		}
	]);

	let selectedGroup = $state<number>(0);
	let activeVerbId = $state<string>('taberu');

	let filteredVerbs = $derived(
		selectedGroup === 0 ? verbList : verbList.filter((v) => v.group === selectedGroup)
	);

	let activeVerb = $derived(verbList.find((v) => v.id === activeVerbId) || verbList[0]);
</script>

<div class="space-y-6">
	<div class="bg-linear-to-r from-brand-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
		<h2 class="text-2xl font-extrabold mb-1">⚡ JLPT N5 Verb Explorer</h2>
		<p class="text-brand-100 text-sm">
			Master verb conjugations, Group 1/2/3 rules, and all N5 operational forms with full Kana
			guides.
		</p>
	</div>

	<div
		class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
	>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center space-x-2">
				<span class="text-xs font-bold text-slate-400 uppercase">Group:</span>
				{#each [0, 1, 2, 3] as grp (grp)}
					<button
						onclick={() => (selectedGroup = grp)}
						class="px-3 py-1 text-xs font-bold rounded-lg transition-all {selectedGroup === grp
							? 'bg-brand-500 text-white shadow-sm'
							: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}"
					>
						{grp === 0 ? 'All' : `Group ${grp}`}
					</button>
				{/each}
			</div>

			<div class="flex items-center space-x-2">
				<span class="text-xs font-bold text-slate-400 uppercase">Select Verb:</span>
				<select
					bind:value={activeVerbId}
					class="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
				>
					{#each filteredVerbs as v (v.id)}
						<option value={v.id}>{v.dictionary} ({v.reading}) - {v.english}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	{#if activeVerb}
		<div
			class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
		>
			<div>
				<span
					class="px-2.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs rounded-full"
				>
					Group {activeVerb.group} Verb
				</span>
				<h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
					{activeVerb.dictionary}
					<span class="text-base font-medium text-slate-400">({activeVerb.reading})</span>
				</h3>
				<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{activeVerb.english}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each Object.entries(activeVerb.forms) as [key, form] (key)}
				<div
					class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-brand-500 transition space-y-2"
				>
					<div
						class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400"
					>
						{form.formName}
					</div>

					<div class="space-y-0.5">
						<div class="text-xl font-bold text-slate-800 dark:text-slate-100">
							{form.kanji}
						</div>
						<div class="text-xs text-rose-500 font-medium">
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
