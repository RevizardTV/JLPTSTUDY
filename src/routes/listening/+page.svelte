<script lang="ts">
	import { questionSets } from '#lib/stores.js';
	import ListeningUploadModal from '#lib/components/modals/ListeningSetUploadModal.svelte';

	let showUploadModal = $state(false);
	let activeSetId = $state<string | null>(null);
	let userAnswers = $state<Record<number, number>>({});
	let isSubmitted = $state(false);

	const listeningSets = $derived($questionSets.filter((s) => s.category === 'listening'));

	const activeSet = $derived(
		listeningSets.find((s) => s.id === activeSetId) ?? listeningSets[0] ?? null
	);

	function handleSelectOption(qNum: number, optIdx: number) {
		if (isSubmitted) return;
		userAnswers[qNum] = optIdx;
	}

	function calculateScore() {
		if (!activeSet) return 0;
		return activeSet.questions.reduce((score, q) => {
			return userAnswers[q.qNum] === q.answer ? score + 1 : score;
		}, 0);
	}
</script>

<div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
	<!-- Top Bar -->
	<div
		class="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
	>
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
				Listening Practice Explorer
			</h2>
			<p class="text-xs text-slate-400">
				Stream audio, view PDF booklets, and record option choices
			</p>
		</div>
		<button
			onclick={() => (showUploadModal = true)}
			class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition"
		>
			+ Add Listening Set
		</button>
	</div>

	<!-- Set Selection Tabs if multiple exist -->
	{#if listeningSets.length > 1}
		<div class="flex gap-2 overflow-x-auto pb-2">
			{#each listeningSets as set (set.id)}
				<button
					onclick={() => {
						activeSetId = set.id;
						userAnswers = {};
						isSubmitted = false;
					}}
					class={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
						activeSet?.id === set.id
							? 'bg-brand-500 text-white border-brand-600 shadow'
							: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
					}`}
				>
					{set.title}
				</button>
			{/each}
		</div>
	{/if}

	{#if activeSet}
		<!-- Active Listening Interface -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- PDF Booklet & Audio Player Panel -->
			<div
				class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col"
			>
				<h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{activeSet.title}</h3>

				<!-- Audio Player -->
				{#if activeSet.listeningAssets?.audioUrl}
					<audio controls class="w-full">
						<source src={activeSet.listeningAssets.audioUrl} />
						Your browser does not support the audio element.
					</audio>
				{:else}
					<div class="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-medium">
						No audio track attached to this set.
					</div>
				{/if}

				<!-- PDF Viewer -->
				{#if activeSet.listeningAssets?.pdfUrl}
					<iframe
						src={activeSet.listeningAssets.pdfUrl}
						title="Listening Questions Booklet"
						class="w-full h-125 rounded-xl border border-slate-200 dark:border-slate-700"
					></iframe>
				{:else}
					<div
						class="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs"
					>
						No PDF booklet provided.
					</div>
				{/if}
			</div>

			<!-- Blank Options Answer Grid -->
			<div
				class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6"
			>
				<div
					class="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700"
				>
					<h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Answer Sheet</h4>
					{#if isSubmitted}
						<span
							class="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"
						>
							Score: {calculateScore()} / {activeSet.questions.length}
						</span>
					{/if}
				</div>

				<div class="space-y-4 max-h-125 overflow-y-auto pr-2">
					{#each activeSet.questions as q (q.qNum)}
						<div
							class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
						>
							<span class="text-xs font-bold text-slate-700 dark:text-slate-300"
								>Question {q.qNum}</span
							>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as optIdx (optIdx)}
									<button
										onclick={() => handleSelectOption(q.qNum, optIdx)}
										class={`py-2 rounded-lg font-bold text-xs transition border ${
											userAnswers[q.qNum] === optIdx
												? 'bg-brand-500 text-white border-brand-600'
												: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
										} ${
											isSubmitted && q.answer === optIdx
												? 'ring-2 ring-emerald-500 border-emerald-500'
												: ''
										}`}
									>
										{optIdx + 1}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<div class="pt-2">
					{#if !isSubmitted}
						<button
							onclick={() => (isSubmitted = true)}
							class="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow text-xs transition"
						>
							Submit Answers
						</button>
					{:else}
						<button
							onclick={() => {
								isSubmitted = false;
								userAnswers = {};
							}}
							class="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
						>
							Reset & Retry
						</button>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div
			class="py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
		>
			No listening sets available. Click "+ Add Listening Set" to upload audio, PDF booklets, and
			answer keys.
		</div>
	{/if}

	{#if showUploadModal}
		<ListeningUploadModal onclose={() => (showUploadModal = false)} />
	{/if}
</div>
