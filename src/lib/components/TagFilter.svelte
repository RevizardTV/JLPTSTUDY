<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import { SvelteSet } from 'svelte/reactivity';

  let { selectedTags = $bindable() }: { selectedTags: Set<string> } = $props();

  let searchQuery = $state("");

  // Dynamically extract all unique tags using SvelteSet for local uniqueness
  let allTags = $derived(() => {
    const set = new SvelteSet<string>();
    $questionSets.forEach((qSet) => {
      qSet.tags?.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  });

  // Filter tags by search query and sort checked tags to the top
  let filteredAndSortedTags = $derived(() => {
    const query = searchQuery.toLowerCase().trim();

    return allTags()
      .filter((tag) => tag.toLowerCase().includes(query))
      .sort((a, b) => {
        const aChecked = selectedTags.has(a);
        const bChecked = selectedTags.has(b);

        if (aChecked && !bChecked) return -1;
        if (!aChecked && bChecked) return 1;

        return a.localeCompare(b);
      });
  });

  function toggleTag(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }

  function clearFilters() {
    selectedTags.clear();
  }
</script>

<div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
  <div class="flex items-center justify-between">
    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Filter by Tags</h4>
    {#if selectedTags.size > 0}
      <button onclick={clearFilters} class="text-xs text-brand-500 hover:underline font-medium">
        Clear all ({selectedTags.size})
      </button>
    {/if}
  </div>

  <input
    type="text"
    placeholder="Search tags..."
    bind:value={searchQuery}
    class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
  />

  <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
    {#each filteredAndSortedTags() as tag (tag)}
      {@const isChecked = selectedTags.has(tag)}
      <button
        onclick={() => toggleTag(tag)}
        class={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
          isChecked
            ? 'bg-brand-500 text-white shadow-sm'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
        }`}
      >
        <span>#{tag}</span>
        {#if isChecked}
          <span class="text-[10px] bg-white/20 px-1 rounded">✓</span>
        {/if}
      </button>
    {:else}
      <p class="text-xs text-slate-400 py-2 italic">No tags found.</p>
    {/each}
  </div>
</div>