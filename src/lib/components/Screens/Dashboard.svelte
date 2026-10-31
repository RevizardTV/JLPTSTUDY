<script lang="ts">
	import { questionSets, userProgress, deleteQuestionSet, resetSetProgress } from '#lib/stores.js';
	import TagFilter from '#lib/components/filters/TagFilter.svelte';
	import PackFilter from '#lib/components/filters/PackFilter.svelte';
	import SetCard from '#lib/components/cards/QuestionSetCard.svelte';
	import BatchUploadModal from '#lib/components/modals/BatchUploadModal.svelte';
	import MultiSetUploadModal from '#lib/components/modals/MultiSetUploadModal.svelte';
	import SingleUploadModal from '#lib/components/modals/SingleUploadModal.svelte';
	import CustomBuilderModal from '#lib/components/modals/CustomBuilderModal.svelte';
	import DataWiper from '#lib/components/buttons/DataWiper.svelte';
	import type { QuizConfig, SetProgress, UserAnswer } from '#lib/types.js';
	import { exportVisibleMissedQuestionsAsText } from '#lib/utils/wrongGiver.ts';
	import { exportAllQuestionsAsText } from '#lib/utils/exportUtils.ts';
	import { exportAttemptedQuestionsAsText } from '#lib/utils/exportAnsweredUtils.js';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		onnavigate
	}: {
		onnavigate: (event: { screen: string; config?: QuizConfig }) => void;
	} = $props();

	let selectedCategory = $state<string>('all');
	let selectedStatus = $state<string>('all');
	let showBatchModal = $state<boolean>(false);
	let showMultiModal = $state<boolean>(false);
	let showSingleModal = $state<boolean>(false);
	let showCustomModal = $state<boolean>(false);

	// Native SvelteSet instances (no $state wrapping needed)
	let selectedSetIds = new SvelteSet<string>();

	const getInitialTags = (): string[] => {
		if (typeof window === 'undefined') return [];
		try {
			const saved = localStorage.getItem('kanji_selected_tags');
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	};

	const getInitialPacks = (): string[] => {
		if (typeof window === 'undefined') return [];
		try {
			const saved = localStorage.getItem('kanji_selected_packs');
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	};

	// svelte-ignore non_reactive_update
	let selectedTags: SvelteSet<string> = new SvelteSet(getInitialTags());
	// svelte-ignore non_reactive_update
	let selectedPacks: SvelteSet<string> = new SvelteSet(getInitialPacks());

	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('kanji_selected_tags', JSON.stringify(Array.from(selectedTags)));
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('kanji_selected_packs', JSON.stringify(Array.from(selectedPacks)));
		}
	});

	const categories = ['all', 'grammar', 'kanji', 'reading', 'vocabulary'] as const;
	const statuses = [
		{ id: 'all', label: 'All Status' },
		{ id: 'pending', label: 'Pending' },
		{ id: 'in-progress', label: 'In Progress' },
		{ id: 'work-required', label: 'Work Required' },
		{ id: 'completed', label: 'Completed' }
	] as const;

	function getSetStatus(set: (typeof $questionSets)[number]): string {
		const progress = $userProgress.completedSets[set.id] as SetProgress | undefined;
		const totalQuestions = set.questions.length;

		if (
			!progress ||
			(progress.attemptedCount === undefined &&
				!progress.bestScore &&
				progress.currentIndex === undefined)
		) {
			return 'pending';
		}

		const attemptedCount =
			progress.attemptedCount || (progress.userAnswers ? progress.userAnswers.length : 0);
		const correctCount =
			progress.bestScore !== undefined
				? progress.bestScore
				: progress.userAnswers
					? progress.userAnswers.filter((a) => a.isCorrect).length
					: 0;
		const incorrectCount = Math.max(0, attemptedCount - correctCount);
		const hasMistakes = incorrectCount > 0;

		if (correctCount === totalQuestions && !hasMistakes) {
			return 'completed';
		}
		if (hasMistakes) {
			return 'work-required';
		}
		return 'in-progress';
	}

	let filteredSets = $derived(
		$questionSets.filter((s) => {
			const matchesCategory =
				selectedCategory === 'all' || (s.category || 'kanji') === selectedCategory;
			const matchesTags = selectedTags.size === 0 || s.tags?.some((tag) => selectedTags.has(tag));
			const matchesPacks =
				selectedPacks.size === 0 || (s.packTitle && selectedPacks.has(s.packTitle));

			const currentStatus = getSetStatus(s);
			const matchesStatus = selectedStatus === 'all' || currentStatus === selectedStatus;

			return matchesCategory && matchesTags && matchesPacks && matchesStatus;
		})
	);

	const isAllVisibleSelected = $derived(
		filteredSets.length > 0 && filteredSets.every((s) => selectedSetIds.has(s.id))
	);

	function toggleSelectAllVisible() {
		if (isAllVisibleSelected) {
			filteredSets.forEach((s) => selectedSetIds.delete(s.id));
		} else {
			filteredSets.forEach((s) => selectedSetIds.add(s.id));
		}
	}

	function toggleSetSelection(setId: string) {
		if (selectedSetIds.has(setId)) {
			selectedSetIds.delete(setId);
		} else {
			selectedSetIds.add(setId);
		}
	}

	function handleBatchReset() {
		const idsToReset = Array.from(selectedSetIds).filter((id) =>
			filteredSets.some((s) => s.id === id)
		);
		if (idsToReset.length === 0) return;

		if (
			confirm(
				`Are you sure you want to reset progress for the ${idsToReset.length} selected set(s)?`
			)
		) {
			idsToReset.forEach((id) => resetSetProgress(id));
			selectedSetIds.clear();
		}
	}

	function handleBatchDelete() {
		const idsToDelete = Array.from(selectedSetIds).filter((id) =>
			filteredSets.some((s) => s.id === id)
		);
		if (idsToDelete.length === 0) return;

		if (
			confirm(
				`Are you sure you want to permanently delete the ${idsToDelete.length} selected set(s)?`
			)
		) {
			idsToDelete.forEach((id) => deleteQuestionSet(id));
			selectedSetIds.clear();
		}
	}

	function startQuiz(config: QuizConfig) {
		onnavigate({ screen: 'quiz', config });
	}

	function handleDelete(setId: string, title: string) {
		if (confirm(`Are you sure you want to delete "${title}" (${setId})?`)) {
			deleteQuestionSet(setId);
		}
	}
	function handleExportAll() {
		exportAllQuestionsAsText($questionSets);
	}
	function handleExportAttempted() {
		const completedSets = $userProgress.completedSets;

		const allAnswers: UserAnswer[] = Object.values(completedSets).flatMap((val) => {
			if (
				typeof val === 'object' &&
				val !== null &&
				'userAnswers' in val &&
				Array.isArray(val.userAnswers)
			) {
				return val.userAnswers;
			}
			return [];
		});

		exportAttemptedQuestionsAsText(allAnswers);
	}
</script>

<section class="space-y-6">
	<!-- Hero Banner -->
	<div
		class="relative overflow-hidden rounded-2xl bg-linear-to-r from-brand-600 to-rose-500 text-white p-6 sm:p-8 shadow-xl"
	>
		<div class="relative z-10 max-w-2xl">
			<span
				class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3"
				>Japanese Self-Study Portal</span
			>
			<h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Master Japanese Language Skills</h2>
			<p class="text-rose-100 text-sm sm:text-base mb-6">
				Practice grammar, kanji, reading, and vocabulary questions with instant feedback.
			</p>

			<div class="flex flex-wrap gap-3">
				<button
					onclick={() => startQuiz({ mode: 'all', practice: true })}
					class="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow hover:bg-slate-100 transition"
				>
					Start All Questions
				</button>
				<button
					onclick={() => (showCustomModal = true)}
					class="px-5 py-2.5 bg-brand-700/50 hover:bg-brand-700 text-white font-bold rounded-xl border border-white/20 transition"
				>
					Build Custom Package
				</button>
				<button
					onclick={() => (showSingleModal = true)}
					class="px-5 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold rounded-xl border border-white/20 transition"
				>
					+ Add Single Set
				</button>
				<button
					onclick={() => (showMultiModal = true)}
					class="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl border border-white/20 transition"
				>
					+ Multi-Set Upload
				</button>
				<button
					onclick={() => (showBatchModal = true)}
					class="px-5 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold rounded-xl border border-white/20 transition"
				>
					+ Batch JSON
				</button>
			</div>
		</div>
	</div>

	<!-- Category & Status Filter Bars -->
	<div
		class="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
	>
		<!-- Category Filter Bar -->
		<div
			class="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700/50 pb-3 overflow-x-auto"
		>
			<span class="text-xs font-bold uppercase text-slate-400 mr-2 shrink-0">Category:</span>
			{#each categories as cat (cat)}
				<button
					onclick={() => (selectedCategory = cat)}
					class="px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all shrink-0 {selectedCategory ===
					cat
						? 'bg-brand-500 text-white shadow-sm'
						: 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
				>
					{cat}
				</button>
			{/each}
		</div>

		<!-- Status Filter Bar -->
		<div
			class="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700/50 pb-3 overflow-x-auto"
		>
			<span class="text-xs font-bold uppercase text-slate-400 mr-2 shrink-0">Status:</span>
			{#each statuses as status (status.id)}
				<button
					onclick={() => (selectedStatus = status.id)}
					class="px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 {selectedStatus ===
					status.id
						? 'bg-indigo-600 text-white shadow-sm'
						: 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
				>
					{status.label}
				</button>
			{/each}
		</div>

		<!-- Clean Responsive Batch Selection Controls Bar -->
		<div
			class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 text-xs"
		>
			<!-- Left: Checkbox & Selection Counter -->
			<div class="flex items-center space-x-3 shrink-0">
				<label
					class="flex items-center space-x-2 font-bold cursor-pointer text-slate-700 dark:text-slate-200 select-none"
				>
					<input
						type="checkbox"
						checked={isAllVisibleSelected}
						onchange={toggleSelectAllVisible}
						class="rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 w-4 h-4"
					/>
					<span>Select All Visible ({filteredSets.length})</span>
				</label>

				{#if selectedSetIds.size > 0}
					<span
						class="px-2.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold rounded-full"
					>
						{selectedSetIds.size} selected
					</span>
				{/if}
			</div>

			<!-- Right: Action Buttons Group (Only active when selection > 0) -->
			{#if selectedSetIds.size > 0}
				<div class="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
					<!-- Export Mistakes -->
					<button
						onclick={() => {
							const textOutput = exportVisibleMissedQuestionsAsText(filteredSets);
							navigator.clipboard.writeText(textOutput);
							alert('Missed questions from visible sets copied to clipboard as text!');
						}}
						class="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold rounded-xl border border-amber-500/20 transition flex items-center space-x-1.5 shadow-xs"
					>
						<span>📋</span>
						<span>Export Mistakes</span>
					</button>

					<!-- Export All -->
					<button
						onclick={handleExportAll}
						class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							></path>
						</svg>
						<span>Export All</span>
					</button>

					<!-- Export Attempted -->
					<button
						onclick={handleExportAttempted}
						class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span>Export Attempted</span>
					</button>

					<!-- Separator Line -->
					<div class="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

					<!-- Reset Selected -->
					<button
						onclick={handleBatchReset}
						class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
					>
						<span>🔄</span>
						<span>Reset</span>
					</button>

					<!-- Delete Selected -->
					<button
						onclick={handleBatchDelete}
						class="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl border border-rose-500/20 transition flex items-center space-x-1.5 shadow-xs"
					>
						<span>🗑️</span>
						<span>Delete</span>
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="space-y-4">
		<PackFilter bind:selectedPacks />
		<TagFilter bind:selectedTags />
	</div>

	<DataWiper />

	<!-- Exercise Grid with Clean Interactive Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredSets as set (set.id)}
			<SetCard
				{set}
				progress={$userProgress.completedSets[set.id]}
				isSelected={selectedSetIds.has(set.id)}
				onselect={() => toggleSetSelection(set.id)}
				onstart={startQuiz}
				ondelete={handleDelete}
			/>
		{:else}
			<div
				class="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
			>
				No question sets match your selected category, status, pack collections, or tag filters.
			</div>
		{/each}
	</div>

	<!-- Modals -->
	{#if showBatchModal}
		<BatchUploadModal onclose={() => (showBatchModal = false)} />
	{/if}

	{#if showMultiModal}
		<MultiSetUploadModal onclose={() => (showMultiModal = false)} />
	{/if}

	{#if showSingleModal}
		<SingleUploadModal onclose={() => (showSingleModal = false)} />
	{/if}

	{#if showCustomModal}
		<CustomBuilderModal
			onstart={(config) => {
				showCustomModal = false;
				startQuiz(config);
			}}
			onclose={() => (showCustomModal = false)}
		/>
	{/if}
</section>
