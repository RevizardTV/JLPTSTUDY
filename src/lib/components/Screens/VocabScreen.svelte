<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet, VocabItem, Question } from '#lib/types.js';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import VocabUploadModal from '#lib/components/modals/VocabUploadModal.svelte';

  let kanjiQuery = $state<string>("");
  let kanaQuery = $state<string>("");
  let romajiQuery = $state<string>("");
  let tagSearchQuery = $state<string>("");
  let selectedTags = $state<SvelteSet<string>>();
  let showVocabModal = $state<boolean>(false);

  const questionReadingMap = $derived.by(() => {
    const map = new SvelteMap<string, string>();
    ($questionSets as QuestionSet[]).forEach(set => {
      set.questions.forEach((q: Question) => {
        const target = q.kanji || q.prompt;
        const reading = q.reading || q.options[q.answer]?.kana || q.options[0]?.kana;
        if (target && reading) {
          map.set(target.trim(), reading.trim());
        }
      });
    });
    return map;
  });

  const allVocab = $derived(
    ($questionSets as QuestionSet[]).flatMap((s: QuestionSet) => s.vocab || [])
  );

  const availableVocabTags = $derived.by(() => {
    const tagsSet = new SvelteSet<string>();
    allVocab.forEach((item) => {
      if (typeof item === 'object' && item !== null && Array.isArray((item as VocabItem).vocabTags)) {
        (item as VocabItem).vocabTags!.forEach(t => tagsSet.add(t.toLowerCase().trim()));
      }
    });
    return Array.from(tagsSet).sort();
  });

  const filteredAvailableTags = $derived.by(() => {
    const query = tagSearchQuery.toLowerCase().trim();
    const activeTags = selectedTags ?? new SvelteSet<string>();
    return availableVocabTags.filter(tag => 
      activeTags.has(tag) || !query || tag.includes(query)
    );
  });

  function toggleTag(tag: string) {
    if (!selectedTags) {
      selectedTags = new SvelteSet<string>();
    }
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }

  function parseVocabItem(item: VocabItem | string) {
    const rawWord = typeof item === 'string' ? item : item.word;
    const meaning = typeof item === 'string' ? 'N/A' : item.meaning;
    const explicitKana = typeof item === 'object' && item !== null ? (item as VocabItem).kana : undefined;
    const explicitRomaji = typeof item === 'object' && item !== null ? (item as VocabItem).romaji : undefined;
    const vocabTags = typeof item === 'object' && item !== null && Array.isArray((item as VocabItem).vocabTags) ? (item as VocabItem).vocabTags! : [];

    let kanji = rawWord;
    let kana = explicitKana || '';

    const match = rawWord.match(/^([^(]+)\(([^)]+)\)$/);
    if (!kana && match) {
      kanji = match[1].trim();
      kana = match[2].trim();
    }

    if (!kana && questionReadingMap.has(kanji)) {
      kana = questionReadingMap.get(kanji)!;
    }

    if (!kana) {
      kana = kanji;
    }

    return {
      kanji,
      kana,
      romaji: explicitRomaji || '',
      meaning,
      vocabTags
    };
  }

  const filteredVocab = $derived(
    allVocab.map((item: VocabItem | string) => parseVocabItem(item)).filter(item => {
      const qKanji = kanjiQuery;
      const qKana = kanaQuery;
      const qRomaji = romajiQuery;

      const matchesKanji = !qKanji.trim() || item.kanji.toLowerCase().includes(qKanji.toLowerCase().trim());
      const matchesKana = !qKana.trim() || item.kana.toLowerCase().includes(qKana.toLowerCase().trim());
      const matchesRomaji = !qRomaji.trim() || 
        item.meaning.toLowerCase().includes(qRomaji.toLowerCase().trim()) ||
        item.romaji.toLowerCase().includes(qRomaji.toLowerCase().trim());
      
      let matchesTags = true;
      const activeTags = selectedTags ?? new SvelteSet<string>();
      if (activeTags.size > 0) {
        const itemTagsLower = item.vocabTags.map(t => t.toLowerCase().trim());
        for (const t of activeTags) {
          if (!itemTagsLower.includes(t)) {
            matchesTags = false;
            break;
          }
        }
      }

      return matchesKanji && matchesKana && matchesRomaji && matchesTags;
    })
  );

  function clearAllFilters() {
    kanjiQuery = "";
    kanaQuery = "";
    romajiQuery = "";
    tagSearchQuery = "";
    if (selectedTags) {
      selectedTags.clear();
    } else {
      selectedTags = new SvelteSet<string>();
    }
  }

  const hasActiveFilters = $derived(
    kanjiQuery.trim().length > 0 || 
    kanaQuery.trim().length > 0 || 
    romajiQuery.trim().length > 0 || 
    tagSearchQuery.trim().length > 0 || 
    (selectedTags ? selectedTags.size > 0 : false)
  );
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Vocabulary Reference</h2>
      <p class="text-slate-500 text-sm">Filter vocabulary by Kanji, Kana, Romaji/Meaning, or combine multiple tags.</p>
    </div>
    
    <div class="flex items-center space-x-2">
      <button 
        onclick={() => showVocabModal = true}
        class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow">
        + Upload Vocab JSON
      </button>

      {#if hasActiveFilters}
        <button 
          onclick={clearAllFilters}
          class="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition">
          Clear Filters
        </button>
      {/if}
    </div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="kanji-filter" class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Kanji</label>
        <input 
          id="kanji-filter"
          type="text" 
          bind:value={kanjiQuery} 
          placeholder="e.g. 学校..." 
          class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-slate-200"
        />
      </div>

      <div class="space-y-1">
        <label for="kana-filter" class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Kana</label>
        <input 
          id="kana-filter"
          type="text" 
          bind:value={kanaQuery} 
          placeholder="e.g. がっこう..." 
          class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-slate-200"
        />
      </div>

      <div class="space-y-1">
        <label for="romaji-filter" class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Romaji / Meaning</label>
        <input 
          id="romaji-filter"
          type="text" 
          bind:value={romajiQuery} 
          placeholder="e.g. school..." 
          class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-slate-200"
        />
      </div>
    </div>

    <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Tags (Multi-select):</span>
        <div class="w-full sm:w-64">
          <input 
            type="text" 
            bind:value={tagSearchQuery} 
            placeholder="Search specific tags..." 
            class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {#if availableVocabTags.length > 0}
        <div class="flex flex-wrap items-center gap-1.5">
          {#if selectedTags && selectedTags.size > 0}
            <div class="flex flex-wrap items-center gap-1.5 pr-2 mr-2 border-r border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-brand-500 uppercase">Active:</span>
              {#each Array.from(selectedTags) as tag (tag)}
                <button
                  onclick={() => toggleTag(tag)}
                  class="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all bg-brand-500 text-white flex items-center space-x-1 shadow-sm"
                >
                  <span>#{tag}</span>
                  <span class="text-[10px] ml-1 opacity-80">✕</span>
                </button>
              {/each}
            </div>
          {/if}

          {#each filteredAvailableTags as tag (tag)}
            {#if !(selectedTags && selectedTags.has(tag))}
              <button
                onclick={() => toggleTag(tag)}
                class="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                #{tag}
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredVocab as item, idx (item.kanji + idx)}
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-3 transition hover:shadow-md">
        <div>
          <div class="flex justify-between items-start">
            <div class="text-2xl font-bold font-japanese text-brand-600 dark:text-brand-400 mb-2">
              {item.kanji}
            </div>
            {#if item.vocabTags && item.vocabTags.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each item.vocabTags as tag (tag)}
                  <span class="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20 capitalize font-medium">
                    #{tag}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
          
          <div class="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-japanese text-xs rounded-lg border border-slate-200 dark:border-slate-600">
             <span class="text-slate-400 text-[10px] font-sans">Kana:</span>
             <span class="font-bold text-brand-500">{item.kana}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
          <span class="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Meaning</span>
          <span class="font-semibold text-slate-700 dark:text-slate-200">
            {item.meaning}
            {#if item.romaji}
              <span class="text-slate-400 font-normal ml-1">({item.romaji})</span>
            {/if}
          </span>
        </div>
      </div>
    {:else}
      <div class="col-span-full py-12 text-center text-slate-400">
        No vocabulary items match your combined search filters and selected tags.
      </div>
    {/each}
  </div>
</div>

{#if showVocabModal}
  <VocabUploadModal onclose={() => showVocabModal = false} />
{/if}