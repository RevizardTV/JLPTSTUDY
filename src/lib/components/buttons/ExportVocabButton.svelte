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

	interface RawVocabItem {
		word?: string;
		kanji?: string;
		reading?: string;
		kana?: string;
		meaning?: string;
		english?: string;
		vocabTags?: string[];
	}

	function buildExportList(): ExtendedVocabExport[] {
		const exportList: ExtendedVocabExport[] = [];

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
		} else if (visibleSets && visibleSets.length > 0) {
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

		return exportList;
	}

	function downloadFile(content: string, filename: string, mimeType: string) {
		const dataStr = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', filename);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
	}

	function exportVisibleVocabJson() {
		const exportList = buildExportList();
		if (exportList.length === 0) {
			alert('No vocabulary items available to export.');
			return;
		}

		const jsonContent = JSON.stringify(exportList, null, 2);
		const filename = `japanese_vocab_export_${new Date().toISOString().slice(0, 10)}.json`;
		downloadFile(jsonContent, filename, 'text/json');
	}

	function exportVisibleVocabText() {
		const exportList = buildExportList();
		if (exportList.length === 0) {
			alert('No vocabulary items available to export.');
			return;
		}

		const textLines: string[] = ['Vocab:'];
		exportList.forEach((item) => {
			const word = item.word || 'N/A';
			const kanaStr = item.reading ? ` (${item.reading})` : '';
			const romajiStr = item.romaji ? ` [${item.romaji}]` : '';
			const tagsStr =
				item.vocabTags && item.vocabTags.length > 0 ? ` (${item.vocabTags.join(', ')})` : '';

			// Format: Word (kana) [romaji] - Meaning (tags)
			textLines.push(`${word}${kanaStr}${romajiStr} - ${item.meaning}${tagsStr}`);
		});

		const textContent = textLines.join('\n');
		const filename = `japanese_vocab_export_${new Date().toISOString().slice(0, 10)}.txt`;
		downloadFile(textContent, filename, 'text/plain');
	}

	const itemCount = $derived(vocabItems.length > 0 ? vocabItems.length : visibleSets.length);
	const isDisabled = $derived(visibleSets.length === 0 && vocabItems.length === 0);
</script>

<div class="flex items-center space-x-1.5">
	<button
		onclick={exportVisibleVocabJson}
		disabled={isDisabled}
		class="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl border border-indigo-500/20 transition flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
		title="Download vocabulary list as JSON"
	>
		<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
			></path>
		</svg>
		<span>Export JSON ({itemCount})</span>
	</button>

	<button
		onclick={exportVisibleVocabText}
		disabled={isDisabled}
		class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
		title="Download vocabulary list as Text (.txt)"
	>
		<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			></path>
		</svg>
		<span>Export Text (.txt)</span>
	</button>
</div>
