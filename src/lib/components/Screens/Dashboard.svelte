<script lang="ts">
  import { questionSets, userProgress, deleteQuestionSet } from '#lib/stores.js';
  import TagFilter from '#lib/components/filters/TagFilter.svelte';
  import PackFilter from '#lib/components/filters/PackFilter.svelte';
  import SetCard from '#lib/components/cards/QuestionSetCard.svelte';
  import BatchUploadModal from '#lib/components/modals/BatchUploadModal.svelte';
  import MultiSetUploadModal from '#lib/components/modals/MultiSetUploadModal.svelte';
  import SingleUploadModal from '#lib/components/modals/SingleUploadModal.svelte';
  import CustomBuilderModal from '#lib/components/modals/CustomBuilderModal.svelte';
  import DataWiper from '#lib/components/buttons/DataWiper.svelte';
  import type { QuizConfig } from '#lib/types.js';

  let { onnavigate }: { 
    onnavigate: (event: { screen: string; config?: QuizConfig }) => void 
  } = $props();

  let selectedCategory = $state<string>('all');
  let showBatchModal = $state<boolean>(false);
  let showMultiModal = $state<boolean>(false);
  let showSingleModal = $state<boolean>(false);
  let showCustomModal = $state<boolean>(false);

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

  let selectedTags = $state<Set<string>>(new Set(getInitialTags()));
  let selectedPacks = $state<Set<string>>(new Set(getInitialPacks()));

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

  let filteredSets = $derived(
    $questionSets.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || (s.category || 'kanji') === selectedCategory;
      const matchesTags = selectedTags.size === 0 || s.tags?.some((tag) => selectedTags.has(tag));
      const matchesPacks = selectedPacks.size === 0 || (s.packTitle && selectedPacks.has(s.packTitle));
      return matchesCategory && matchesTags && matchesPacks;
    })
  );

  function startQuiz(config: QuizConfig) {
    onnavigate({ screen: 'quiz', config });
  }

  function handleDelete(setId: string, title: string) {
    if (confirm(`Are you sure you want to delete "${title}" (${setId})?`)) {
      deleteQuestionSet(setId);
    }
  }
</script>

<section class="space-y-6">
  <!-- Hero Banner -->
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-brand-600 to-rose-500 text-white p-6 sm:p-8 shadow-xl">
    <div class="relative z-10 max-w-2xl">
      <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">Japanese Self-Study Portal</span>
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Master Japanese Language Skills</h2>
      <p class="text-rose-100 text-sm sm:text-base mb-6">Practice grammar, kanji, reading, and vocabulary questions with instant feedback.</p>
      
      <div class="flex flex-wrap gap-3">
        <button onclick={() => startQuiz({ mode: 'all', practice: true })} class="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow hover:bg-slate-100 transition">
          Start All Questions
        </button>
        <button onclick={() => showCustomModal = true} class="px-5 py-2.5 bg-brand-700/50 hover:bg-brand-700 text-white font-bold rounded-xl border border-white/20 transition">
          Build Custom Package
        </button>
        <button onclick={() => showSingleModal = true} class="px-5 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold rounded-xl border border-white/20 transition">
          + Add Single Set
        </button>
        <button onclick={() => showMultiModal = true} class="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl border border-white/20 transition">
          + Multi-Set Upload
        </button>
        <button onclick={() => showBatchModal = true} class="px-5 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold rounded-xl border border-white/20 transition">
          + Batch JSON
        </button>
      </div>
    </div>
  </div>

  <!-- Category Filter Bar -->
  <div class="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto">
    <span class="text-xs font-bold uppercase text-slate-400 mr-2">Category:</span>
    {#each categories as cat (cat)}
      <button 
        onclick={() => selectedCategory = cat}
        class="px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all {selectedCategory === cat ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'}">
        {cat}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    <PackFilter bind:selectedPacks />
    <TagFilter bind:selectedTags />
  </div>

  <DataWiper />

  <!-- Componentised Exercise Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredSets as set (set.id)}
      <SetCard 
        {set} 
        progress={$userProgress.completedSets[set.id]} 
        onstart={startQuiz} 
        ondelete={handleDelete} 
      />
    {:else}
      <div class="col-span-full py-12 text-center text-slate-400">
        No question sets match your selected category, pack collections, or tag filters.
      </div>
    {/each}
  </div>

  <!-- Modals -->
  {#if showBatchModal}
    <BatchUploadModal onclose={() => showBatchModal = false} />
  {/if}

  {#if showMultiModal}
    <MultiSetUploadModal onclose={() => showMultiModal = false} />
  {/if}

  {#if showSingleModal}
    <SingleUploadModal onclose={() => showSingleModal = false} />
  {/if}

  {#if showCustomModal}
    <CustomBuilderModal onstart={(config) => { showCustomModal = false; startQuiz(config); }} onclose={() => showCustomModal = false} />
  {/if}
</section>