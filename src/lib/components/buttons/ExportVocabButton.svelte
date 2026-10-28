<script lang="ts">
	import type { QuestionSet } from '#lib/types.js';

	interface ParsedVocabItem {
		kanji: string;
		kana: string;
		romaji: string;
		meaning: string;
		vocabTags?: string[];
	}

	let {
		visibleSets = [],
		vocabItems = []
	}: {
		visibleSets?: QuestionSet[];
		vocabItems?: ParsedVocabItem[];
	} = $props();

	interface ExtendedVocabExport {
		word: string;
		reading: string;
		meaning: string;
		romaji?: string;
		vocabTags?: string[];
		setId?: string;
		setTitle?: string;
		category?: string;
		packTitle?: string;
	}

	// Strict type definition for raw set vocabulary items to avoid 'any'
	interface RawVocabItem {
		word?: string;
		kanji?: string;
		reading?: string;
		kana?: string;
		meaning?: string;
		english?: string;
		vocabTags?: string[];
	}

	function exportVisibleVocab() {
		const exportList: ExtendedVocabExport[] = [];

		// 1. If explicit pre-parsed vocab items are passed (from VocabScreen)
		if (vocabItems && vocabItems.length > 0) {
			vocabItems.forEach((item) => {
				exportList.push({
					word: item.kanji,
					reading: item.kana,
					meaning: item.meaning,
					romaji: item.romaji,
					vocabTags: item.vocabTags
				});
			});
		}
		// 2. Otherwise, extract from visible question sets (from Dashboard)
		else if (visibleSets && visibleSets.length > 0) {
			visibleSets.forEach((set) => {
				if (set.vocab && set.vocab.length > 0) {
					set.vocab.forEach((rawItem: unknown) => {
						const item = rawItem as RawVocabItem;
						exportList.push({
							word: item.word || item.kanji || 'N/A',
							reading: item.reading || item.kana || 'N/A',
							meaning: item.meaning || item.english || 'N/A',
							vocabTags: item.vocabTags,
							setId: set.id,
							setTitle: set.title,
							category: set.category,
							packTitle: set.packTitle
						});
					});
				} else {
					set.questions.forEach((q) => {
						const correctOpt = q.options[q.answer];
						const reading =
							typeof correctOpt === 'object' && correctOpt !== null
								? correctOpt.kana || q.reading || 'N/A'
								: q.reading || 'N/A';

						const english =
							typeof correctOpt === 'object' && correctOpt !== null
								? correctOpt.english || 'N/A'
								: 'N/A';

						exportList.push({
							word: q.prompt,
							reading: reading,
							meaning: english,
							setId: set.id,
							setTitle: set.title,
							category: set.category,
							packTitle: set.packTitle
						});
					});
				}
			});
		}

		const totalCount = vocabItems.length > 0 ? vocabItems.length : visibleSets.length;
		if (exportList.length === 0 || totalCount === 0) {
			alert('No vocabulary items available to export.');
			return;
		}

		// Build and trigger downloadable JSON file
		const dataStr =
			'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportList, null, 2));
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute(
			'download',
			`japanese_vocab_export_${new Date().toISOString().slice(0, 10)}.json`
		);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
	}
</script>

<button
	onclick={exportVisibleVocab}
	disabled={visibleSets.length === 0 && vocabItems.length === 0}
	class="px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl border border-indigo-500/20 transition flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
	title="Download vocabulary list as JSON"
>
	<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
		></path>
	</svg>
	<span>Export Vocab JSON ({vocabItems.length > 0 ? vocabItems.length : visibleSets.length})</span>
</button>
