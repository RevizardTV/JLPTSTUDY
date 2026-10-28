<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet } from '#lib/types.js';

  let searchQuery = $state<string>("");

  // Svelte 5 derived state replacing legacy $:/
  const allVocab = $derived(
    ($questionSets as QuestionSet[]).flatMap(s => s.vocab || [])
  );

  const filteredVocab = $derived(
    allVocab.filter(item => 
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h2 class="text-2xl font-bold">Vocabulary Reference</h2>
      <p class="text-slate-500 text-sm">Real-time search across all stored sets.</p>
    </div>
    <input 
      type="text" 
      bind:value={searchQuery} 
      placeholder="Search vocabulary..." 
      class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-72"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each filteredVocab as item, idx (item.word + idx)}
      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
        <div>
          <h4 class="font-bold text-lg text-brand-600 font-japanese">{item.word}</h4>
          <p class="text-xs text-slate-500">{item.meaning}</p>
        </div>
      </div>
    {/each}
  </div>
</div>