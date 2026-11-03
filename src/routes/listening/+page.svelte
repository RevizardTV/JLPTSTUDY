<script lang="ts">
	import QuickListeningModal from '#lib/components/modals/QuickListeningModal.svelte';
	import type { QuestionListeningSet } from '#lib/types/listening.ts';

	// Explicitly type states to prevent TypeScript compilation errors
	let isModalOpen = $state<boolean>(false);
	let activeListeningSets = $state<QuestionListeningSet[]>([]);

	function handleOpenModal() {
		isModalOpen = true;
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
			onclick={handleOpenModal}
			class="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-2"
		>
			<span>✨</span>
			<span>Open QuickListening Mass Workspace</span>
		</button>
	</div>

	<!-- Active Practice Sets Display Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		{#if activeListeningSets.length === 0}
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
			<!-- Keyed each block -->
			{#each activeListeningSets as set (set.setId)}
				<div
					class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
				>
					<h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">{set.setTitle}</h3>
					<div class="text-xs text-slate-500 space-y-1">
						<p>📄 PDFs: {set.pdfFiles.length}</p>
						<p>🎵 Tracks: {set.audioItems.length}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- QuickListening Mass Modal Component -->
	<QuickListeningModal bind:isOpen={isModalOpen} />
</div>
