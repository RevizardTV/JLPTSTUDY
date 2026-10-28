<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet, QuizConfig } from '#lib/types.js';

  let { onstart, onclose }: { 
    onstart: (config: QuizConfig) => void; 
    onclose: () => void 
  } = $props();
  
  let selectedSetIds = $state<string[]>([]);

  function startCustomQuiz() {
    const sets: QuestionSet[] = $questionSets;
    const selectedSets = sets.filter(s => selectedSetIds.includes(s.id));
    
    const customQuestions = selectedSets.flatMap(s => s.questions.map(q => ({
      ...q,
      setId: s.id,
      setTitle: s.title,
      contextText: s.contextPassages[q.contextIdx] || ""
    })));

    onstart({ mode: 'custom', customQuestions, practice: true });
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
    <h3 class="text-xl font-bold">Build Custom Package</h3>
    <p class="text-xs text-slate-500">Select exercise sets to bundle into a custom package:</p>

    <div class="space-y-2 max-h-60 overflow-y-auto">
      {#each $questionSets as set (set.id)}
        <label class="flex items-center space-x-3 p-2 rounded-lg border border-slate-100 dark:border-slate-700 cursor-pointer">
          <input type="checkbox" value={set.id} bind:group={selectedSetIds} class="rounded text-brand-500" />
          <span class="text-sm font-bold">{set.title} ({set.category || 'kanji'})</span>
        </label>
      {/each}
    </div>

    <div class="flex justify-end space-x-2 pt-4">
      <button onclick={onclose} class="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
      <button onclick={startCustomQuiz} disabled={selectedSetIds.length === 0} class="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl disabled:opacity-50">Start Package</button>
    </div>
  </div>
</div>