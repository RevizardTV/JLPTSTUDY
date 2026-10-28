<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet, VocabItem } from '#lib/types.js';
  import { SvelteMap } from 'svelte/reactivity';

  let { onclose }: { onclose: () => void } = $props();

  let targetSetId = $state<string>('standalone');
  let jsonInput = $state<string>('');
  let errorMessage = $state<string | null>(null);
  let successCount = $state<number | null>(null);

  const availableSets = $derived($questionSets as QuestionSet[]);

  function handleUpload() {
    errorMessage = null;
    successCount = null;

    if (!jsonInput.trim()) {
      errorMessage = 'Please paste a valid JSON array of vocabulary items.';
      return;
    }

    try {
      const parsed: unknown = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        errorMessage = 'Vocab JSON must be a root array (`[...]`).';
        return;
      }

      const validVocab: VocabItem[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] as Record<string, unknown>;

        if (!item || typeof item !== 'object' || !item.word || !item.meaning) {
          errorMessage = `Item at index ${i} is missing required fields ("word" or "meaning").`;
          return;
        }

        const rawTags = item.vocabTags || item.tags;
        const vocabTags = Array.isArray(rawTags) ? rawTags.map((t) => String(t)) : [];

        validVocab.push({
          word: String(item.word),
          meaning: String(item.meaning),
          vocabTags
        });
      }

      questionSets.update((existing) => {
        const setMap = new SvelteMap<string, QuestionSet>(existing.map((s) => [s.id, s]));

        if (targetSetId === 'standalone' || !setMap.has(targetSetId)) {
          const standaloneId = `vocab-import-${Date.now()}`;
          const newSet: QuestionSet = {
            id: standaloneId,
            title: `Direct Vocab Import (${new Date().toLocaleDateString()})`,
            category: 'vocabulary',
            packTitle: 'Custom Vocab',
            tags: ['vocab', 'custom'],
            contextPassages: [],
            questions: [],
            vocab: validVocab
          };
          setMap.set(standaloneId, newSet);
        } else {
          const existingSet = setMap.get(targetSetId)!;
          const updatedVocab = [...(existingSet.vocab || []), ...validVocab];
          setMap.set(targetSetId, {
            ...existingSet,
            vocab: updatedVocab
          });
        }

        const updated = Array.from(setMap.values());
        if (typeof window !== 'undefined') {
          localStorage.setItem('kanji_question_sets', JSON.stringify(updated));
        }

        return updated;
      });

      successCount = validVocab.length;
      setTimeout(() => {
        onclose();
      }, 1200);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      errorMessage = `Invalid JSON format: ${errMsg}`;
    }
  }

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        jsonInput = e.target.result as string;
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl p-6 shadow-2xl space-y-4">
    
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
      <div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <span>📖</span>
          <span>Direct Vocabulary Upload</span>
        </h3>
        <p class="text-xs text-slate-500">Insert vocabulary items with optional vocabTags (noun, verb, animal, counter, etc.).</p>
      </div>
      <button onclick={onclose} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold px-2 py-1 rounded-lg">
        ✕
      </button>
    </div>

    {#if errorMessage}
      <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
        {errorMessage}
      </div>
    {/if}

    {#if successCount !== null}
      <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2">
        <span>✓</span>
        <span>Successfully imported {successCount} vocabulary item{successCount > 1 ? 's' : ''}!</span>
      </div>
    {/if}

    <div class="space-y-1">
      <label for="target-set-select" class="text-xs font-bold uppercase tracking-wider text-slate-400">Target Question Set</label>
      <select
        id="target-set-select"
        bind:value={targetSetId}
        class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
      >
        <option value="standalone">Create Standalone Vocab Package</option>
        {#each availableSets as set (set.id)}
          <option value={set.id}>Append to: {set.title} ({set.id})</option>
        {/each}
      </select>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <label for="vocab-json-textarea" class="text-xs font-bold uppercase tracking-wider text-slate-400">Vocab Array JSON (with vocabTags)</label>
        <label class="text-xs text-brand-500 hover:underline cursor-pointer font-medium">
          <span>📁 Select .json file</span>
          <input type="file" accept=".json" onchange={handleFileUpload} class="hidden" />
        </label>
      </div>

      <textarea
        id="vocab-json-textarea"
        bind:value={jsonInput}
        placeholder={`[\n  {\n    "word": "猫 (ねこ)",\n    "meaning": "cat",\n    "vocabTags": ["animal", "noun"]\n  }\n]`}
        class="w-full h-48 p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      ></textarea>
    </div>

    <div class="flex justify-end space-x-3 pt-2">
      <button
        onclick={onclose}
        class="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition"
      >
        Cancel
      </button>
      <button
        onclick={handleUpload}
        class="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow transition"
      >
        Upload Vocab
      </button>
    </div>

  </div>
</div>