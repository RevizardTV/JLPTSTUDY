<script lang="ts">
	import { questionSets } from '#lib/stores.ts';
	import type { QuestionSet, Question } from '#lib/types.ts';
	import { SvelteMap } from 'svelte/reactivity';

	let { onclose }: { onclose: () => void } = $props();

	let setTitle = $state('');
	let packTitle = $state('');
	let answerKeyText = $state('');
	let audioUrl = $state('');
	let pdfUrl = $state('');
	let errorMessage = $state<string | null>(null);
	let pdfFileName = $state<string>('');
	let audioFileName = $state<string>('');

	// Handle local PDF upload
	function handlePdfSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			pdfFileName = file.name;
			pdfUrl = URL.createObjectURL(file);
		}
	}

	// Handle local Audio upload
	function handleAudioSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			audioFileName = file.name;
			audioUrl = URL.createObjectURL(file);
		}
	}

	function parseAnswerKey(text: string): Question[] {
		const lines = text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean);
		const questions: Question[] = [];

		lines.forEach((line) => {
			// Matches formats like "1. 3" or "Q1: 2" or "1: 4"
			const match = line.match(/^(?:Q)?(\d+)[.:]?\s*(\d+)$/i);
			if (match) {
				const qNum = parseInt(match[1], 10);
				const answerIndex = parseInt(match[2], 10) - 1; // 1-indexed to 0-indexed

				questions.push({
					qNum,
					prompt: '', // Blank question prompt as specified
					contextIdx: 0,
					answer: answerIndex,
					options: [
						{ text: '1', kana: '1', english: 'Option 1' },
						{ text: '2', kana: '2', english: 'Option 2' },
						{ text: '3', kana: '3', english: 'Option 3' },
						{ text: '4', kana: '4', english: 'Option 4' }
					]
				});
			}
		});

		return questions;
	}

	function handleSave() {
		errorMessage = null;

		if (!setTitle.trim()) {
			errorMessage = 'Please provide a title for the listening set.';
			return;
		}

		const parsedQuestions = parseAnswerKey(answerKeyText);

		if (parsedQuestions.length === 0) {
			errorMessage = 'Could not parse valid answers. Use format: "1. 3" or "2. 1" per line.';
			return;
		}

		const newListeningSet: QuestionSet = {
			id: `listening-${Date.now()}`,
			title: setTitle.trim(),
			category: 'listening',
			packTitle: packTitle.trim() || undefined,
			tags: ['listening', 'jlpt'],
			contextPassages: [
				'Listen to the audio track and refer to the attached PDF booklet to answer.'
			],
			questions: parsedQuestions,
			listeningAssets: {
				audioUrl: audioUrl || undefined,
				pdfUrl: pdfUrl || undefined,
				pdfFileName: pdfFileName || undefined,
				audioFileName: audioFileName || undefined
			}
		};

		questionSets.update((existing) => {
			const setMap = new SvelteMap<string, QuestionSet>(existing.map((s) => [s.id, s]));
			setMap.set(newListeningSet.id, newListeningSet);
			const updated = Array.from(setMap.values());
			if (typeof window !== 'undefined') {
				localStorage.setItem('kanji_question_sets', JSON.stringify(updated));
			}
			return updated;
		});

		alert(`Successfully created listening set with ${parsedQuestions.length} questions!`);
		onclose();
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
	<div
		class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
	>
		<div
			class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"
		>
			<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
				<span>🎧</span>
				<span>Create Listening Set</span>
			</h3>
			<button onclick={onclose} class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
		</div>

		{#if errorMessage}
			<div
				class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl"
			>
				{errorMessage}
			</div>
		{/if}

		<div class="space-y-3 text-xs">
			<div>
				<label
					for="listening-set-title"
					class="block font-bold text-slate-500 dark:text-slate-400 mb-1">Set Title</label
				>
				<input
					id="listening-set-title"
					type="text"
					bind:value={setTitle}
					placeholder="e.g. JLPT N5 Listening Practice 01"
					class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
				/>
			</div>

			<div>
				<label
					for="listening-pack-title"
					class="block font-bold text-slate-500 dark:text-slate-400 mb-1"
					>Pack Title (Optional)</label
				>
				<input
					id="listening-pack-title"
					type="text"
					bind:value={packTitle}
					placeholder="e.g. N5 Official Mock Exam"
					class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
				/>
			</div>

			<!-- Audio Source -->
			<div>
				<label
					for="listening-audio-input"
					class="block font-bold text-slate-500 dark:text-slate-400 mb-1"
					>Audio Track (File or URL)</label
				>
				<div class="flex gap-2">
					<input
						id="listening-audio-input"
						type="text"
						bind:value={audioUrl}
						placeholder="Paste audio URL or upload file..."
						class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono text-[11px]"
					/>
					<label
						class="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 cursor-pointer rounded-xl font-bold flex items-center gap-1"
					>
						📁
						<input type="file" accept="audio/*" onchange={handleAudioSelect} class="hidden" />
					</label>
				</div>
				{#if audioFileName}
					<p class="text-[10px] text-emerald-500 mt-1">Loaded: {audioFileName}</p>
				{/if}
			</div>

			<!-- PDF Booklet Source -->
			<div>
				<label
					for="listening-pdf-input"
					class="block font-bold text-slate-500 dark:text-slate-400 mb-1"
					>PDF Questions Booklet (File or URL)</label
				>
				<div class="flex gap-2">
					<input
						id="listening-pdf-input"
						type="text"
						bind:value={pdfUrl}
						placeholder="Paste PDF link or upload file..."
						class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono text-[11px]"
					/>
					<label
						class="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 cursor-pointer rounded-xl font-bold flex items-center gap-1"
					>
						📄
						<input type="file" accept="application/pdf" onchange={handlePdfSelect} class="hidden" />
					</label>
				</div>
				{#if pdfFileName}
					<p class="text-[10px] text-emerald-500 mt-1">Loaded: {pdfFileName}</p>
				{/if}
			</div>

			<!-- Answer Key Input -->
			<div>
				<label
					for="listening-answer-key"
					class="block font-bold text-slate-500 dark:text-slate-400 mb-1"
					>Answer Key (One per line)</label
				>
				<textarea
					id="listening-answer-key"
					bind:value={answerKeyText}
					rows="5"
					placeholder="1. 3&#10;2. 1&#10;3. 4&#10;4. 2"
					class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono outline-none"
				></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<button
				onclick={onclose}
				class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold"
			>
				Cancel
			</button>
			<button
				onclick={handleSave}
				class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow"
			>
				Create Listening Set
			</button>
		</div>
	</div>
</div>
