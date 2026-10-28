<script lang="ts">
  import { questionSets } from '#lib/stores.js';

  let showConfirm = $state<boolean>(false);

  function wipeAllData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kanji_question_sets');
      localStorage.removeItem('kanji_selected_tags');
      localStorage.removeItem('kanji_selected_packs');
    }
    
    // Reset the store back to an empty array
    questionSets.set([]);
    
    // Reload window to clear all cached UI states
    window.location.reload();
  }
</script>

<div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-rose-500/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
  <div>
    <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
      <span>⚠️</span>
      <span>Storage & Data Reset</span>
    </h4>
    <p class="text-xs text-slate-500">Wipe all stored question sets and vocabulary to start fresh with a clean state.</p>
  </div>

  {#if !showConfirm}
    <button 
      onclick={() => showConfirm = true}
      class="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition whitespace-nowrap"
    >
      🗑️ Wipe All Data
    </button>
  {:else}
    <div class="flex items-center space-x-2">
      <span class="text-xs font-semibold text-rose-500">Are you sure?</span>
      <button 
        onclick={wipeAllData}
        class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
      >
        Yes, Wipe
      </button>
      <button 
        onclick={() => showConfirm = false}
        class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
      >
        Cancel
      </button>
    </div>
  {/if}
</div>