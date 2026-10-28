<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import { SvelteSet } from 'svelte/reactivity';

  let { selectedPacks = $bindable() }: { selectedPacks: Set<string> } = $props();

  let searchQuery = $state("");

  // Dynamically extract all unique pack titles from loaded question sets
  let allPacks = $derived(() => {
    const set = new SvelteSet<string>();
    $questionSets.forEach((qSet) => {
      if (qSet.packTitle) set.add(qSet.packTitle);
    });
    return Array.from(set);
  });

  let filteredAndSortedPacks = $derived(() => {
    const query = searchQuery.toLowerCase().trim();

    return allPacks()
      .filter((pack) => pack.toLowerCase().includes(query))
      .sort((a, b) => {
        const aChecked = selectedPacks.has(a);
        const bChecked = selectedPacks.has(b);

        if (aChecked && !bChecked) return -1;
        if (!aChecked && bChecked) return 1;

        return a.localeCompare(b);
      });
  });

  function togglePack(pack: string) {
    if (selectedPacks.has(pack)) {
      selectedPacks.delete(pack);
    } else {
      selectedPacks.add(pack);
    }
  }

  function clearFilters() {
    selectedPacks.clear();
  }
</script>

{#if allPacks().length > 0}
  <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
    <div class="flex items-center justify-between">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Filter by Pack / Collection</h4>
      {#if selectedPacks.size > 0}
        <button onclick={clearFilters} class="text-xs text-brand-500 hover:underline font-medium">
          Clear packs ({selectedPacks.size})
        </button>
      {/if}
    </div>

    <input
      type="text"
      placeholder="Search collections..."
      bind:value={searchQuery}
      class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
    />

    <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
      {#each filteredAndSortedPacks() as pack (pack)}
        {@const isChecked = selectedPacks.has(pack)}
        <button
          onclick={() => togglePack(pack)}
          class={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
            isChecked
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <span>📦 {pack}</span>
          {#if isChecked}
            <span class="text-[10px] bg-white/20 px-1 rounded">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}