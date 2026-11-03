<script lang="ts">
	import QuickListeningModal from '#lib/components/modals/QuickListeningModal.svelte';
	import AudioQuestionSetCard from '#lib/components/cards/AudioQuestionSetCard.svelte';
	import { questionSets, deleteQuestionSet, userProgress } from '#lib/stores.ts';
	import type { QuizConfig } from '#lib/types.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let isModalOpen = $state<boolean>(false);

	function handleStartQuiz(config: QuizConfig) {
		sessionStorage.setItem('current_quiz_config', JSON.stringify(config));
		goto(resolve('/quiz'));
	}

	function handleDeleteSet(setId: string, title: string) {
		if (confirm(`Are you sure you want to delete "${title}"?`)) {
			deleteQuestionSet(setId);
		}
	}
</script>

<div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
	<!-- Header Section -->
	<div
		class="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
	>
		<div class="space-y-1">
			<span class="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-semibold"
				>Listening Practice Studio</span
			>
			<h1 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
				JLPT Listening Workspace
			</h1>
			<p class="text-xs text-slate-500 dark:text-slate-400">
				Manage question booklets (PDFs) and practice audio files with real-time AI transcription.
			</p>
		</div>

		<button
			onclick={() => (isModalOpen = true)}
			class="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-2"
		>
			<span>✨</span>
			<span>Open QuickListening Mass Workspace</span>
		</button>
	</div>

	<!-- Active Practice Sets Grid matching normal cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		{#if $questionSets.filter((s) => s.category === 'listening').length === 0}
			<div
				class="col-span-full py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-center space-y-3"
			>
				<div class="text-4xl">🎧</div>
				<h3 class="font-bold text-sm text-slate-700 dark:text-slate-300">
					No Listening Sets Active
				</h3>
				<p class="text-xs text-slate-400 max-w-sm mx-auto">
					Click the button above to launch the QuickListening modal, upload your PDF question
					booklets and corresponding audio files, and generate transcripts.
				</p>
			</div>
		{:else}
			{#each $questionSets.filter((s) => s.category === 'listening') as set (set.id)}
				<AudioQuestionSetCard
					{set}
					progress={$userProgress.completedSets[set.id]}
					onstart={handleStartQuiz}
					ondelete={handleDeleteSet}
				/>
			{/each}
		{/if}
	</div>

	<!-- QuickListening Mass Modal Component -->
	<QuickListeningModal bind:isOpen={isModalOpen} />
</div>
