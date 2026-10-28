<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet } from '#lib/types.js';
  import { SvelteSet } from 'svelte/reactivity';
  import { getExistingVocabSignatures, filterUniqueVocab } from '#lib/utils/vocabChecker.js';

  let { onclose }: { onclose: () => void } = $props();
  
  let jsonInput = $state("");
  let errorMessage = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  function handleUpload() {
    errorMessage = null;
    successMessage = null;

    if (!jsonInput.trim()) {
      errorMessage = "Please paste a JSON array or object before uploading.";
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const newSets: QuestionSet[] = Array.isArray(parsed) ? parsed : [parsed];

      if (newSets.length === 0) {
        errorMessage = "The JSON data does not contain any valid question sets.";
        return;
      }

      let importedCount = 0;

      questionSets.update((currentSets) => {
        const existingSignatures = getExistingVocabSignatures(currentSets);
        const existingIds = new SvelteSet<string>(currentSets.map((s) => s.id));

        const processedSets = newSets.map((newSet, index) => {
          if (!newSet.id) {
            newSet.id = `set-${Date.now()}-${index}`;
          }

          if (existingIds.has(newSet.id)) {
            newSet.id = `${newSet.id}-${Date.now()}-${index}`;
          }
          existingIds.add(newSet.id);

          importedCount++;

          if (!newSet.vocab || newSet.vocab.length === 0) return newSet;

          const { uniqueVocab } = filterUniqueVocab(newSet.vocab, existingSignatures);
          return { ...newSet, vocab: uniqueVocab };
        });

        const updated = [...currentSets, ...processedSets];
        if (typeof window !== 'undefined') {
          localStorage.setItem('kanji_question_sets', JSON.stringify(updated));
        }

        return updated;
      });

      successMessage = `Successfully imported ${importedCount} question set(s)! Closing...`;
      
      setTimeout(() => {
        onclose();
      }, 1000);

    } catch (e: unknown) {
      console.error("JSON Parse Error details:", e);
      errorMessage = `Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown parsing error'}`;
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
    <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">Batch Upload Question Sets</h3>
    <p class="text-xs text-slate-500">Paste your array of JSON question set objects below:</p>
    
    <textarea bind:value={jsonInput} rows="8" placeholder={`[ { "id": "set-1", "title": "Example Set" } ]`} class="w-full p-3 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"></textarea>

    {#if errorMessage}
      <div class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-semibold">
        ⚠️ {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-semibold">
        ✅ {successMessage}
      </div>
    {/if}

    <div class="flex justify-end space-x-2 pt-2">
      <button onclick={onclose} class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">Cancel</button>
      <button onclick={handleUpload} class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition shadow">Upload Sets</button>
    </div>
  </div>
</div>