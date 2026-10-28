<script lang="ts">
  import { onMount } from 'svelte';
  import { userProgress } from '#lib/stores.js';
  import type { FinishEventData } from '#lib/types.js';

  let { data, onnavigate }: { 
    data: FinishEventData; 
    onnavigate: (event: { screen: string }) => void 
  } = $props();

  onMount(() => {
    userProgress.update(p => {
      p.totalQuizzes += 1;
      if (data.setId) {
        const prevBest = p.completedSets[data.setId]?.bestScore || 0;
        p.completedSets[data.setId] = {
          bestScore: Math.max(prevBest, data.score),
          total: data.total,
          accuracy: Math.round((Math.max(prevBest, data.score) / data.total) * 100)
        };
      }
      return p;
    });
  });
</script>

<div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl text-center space-y-6">
  <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600">
    🎉
  </div>

  <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Quiz Completed!</h2>

  <div class="grid grid-cols-3 gap-3 max-w-lg mx-auto">
    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <p class="text-xs text-slate-500">Score</p>
      <p class="text-xl font-black text-brand-500">{data.score} / {data.total}</p>
    </div>
    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <p class="text-xs text-slate-500">Accuracy</p>
      <p class="text-xl font-black text-emerald-600">{Math.round((data.score / data.total) * 100)}%</p>
    </div>
    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <p class="text-xs text-slate-500">Time</p>
      <p class="text-xl font-black text-slate-700 dark:text-slate-200">{data.secondsElapsed}s</p>
    </div>
  </div>

  <button onclick={() => onnavigate({ screen: 'dashboard' })} class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow transition">
    Back to Dashboard
  </button>
</div>