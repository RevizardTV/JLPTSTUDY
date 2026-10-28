<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet } from '#lib/types.js';
  import { SvelteSet } from 'svelte/reactivity';
  let { onclose }: { onclose: () => void } = $props();
  
  let jsonInput = $state("");

  function normalizeText(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '');
  }

  function handleUpload() {
    try {
      const parsed = JSON.parse(jsonInput);
      const newSets: QuestionSet[] = Array.isArray(parsed) ? parsed : [parsed];

      questionSets.update((currentSets) => {
        // Collect all existing normalized vocab entries across all current sets
        const existingVocabSet = new SvelteSet<string>();
        currentSets.forEach((set) => {
          set.vocab?.forEach((v) => {
            existingVocabSet.add(normalizeText(v.word));
          });
        });

        // Process incoming sets and filter out duplicate vocab words
        const processedSets = newSets.map((newSet) => {
          if (!newSet.vocab) return newSet;

          const uniqueVocab = newSet.vocab.filter((v) => {
            const normalized = normalizeText(v.word);
            if (existingVocabSet.has(normalized)) {
              return false; // Skip if it already exists globally
            }
            existingVocabSet.add(normalized); // Mark as seen
            return true;
          });

          return { ...newSet, vocab: uniqueVocab };
        });

        return [...currentSets, ...processedSets];
      });

      onclose();
    } catch (e: unknown) {
      console.error("JSON Parse Error details:", e);
      alert(`Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
    <h3 class="text-xl font-bold">Batch Upload Question Sets</h3>
    <p class="text-xs text-slate-500">Paste your array of JSON question set objects below:</p>
    
    <textarea bind:value={jsonInput} rows="8" class="w-full p-3 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"></textarea>

    <div class="flex justify-end space-x-2">
      <button onclick={onclose} class="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
      <button onclick={handleUpload} class="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl">Upload Sets</button>
    </div>
  </div>
</div>