<script lang="ts">
  import { userProgress } from '#lib/stores.js';
  import type { SetProgress } from '#lib/types.js';

  // Svelte 5 derived state replacing legacy $:
  const completedList = $derived(
    Object.entries($userProgress.completedSets) as [string, SetProgress][]
  );
</script>

<div class="space-y-6 max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold">Learning Analytics & Category Stats</h2>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
      <span class="text-xs text-slate-500 uppercase font-semibold">Total Quizzes Taken</span>
      <div class="text-4xl font-extrabold text-brand-500 my-2">{$userProgress.totalQuizzes}</div>
    </div>
  </div>

  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
    <h3 class="font-bold mb-4">Set-by-Set Performance History</h3>
    <table class="w-full text-left text-sm border-collapse">
      <thead>
        <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
          <th class="py-2">Set ID</th>
          <th class="py-2">Best Score</th>
          <th class="py-2">Accuracy</th>
        </tr>
      </thead>
      <tbody>
        {#each completedList as [setId, data] (setId)}
          <tr class="border-b border-slate-100 dark:border-slate-700/50">
            <td class="py-3 font-bold">{setId}</td>
            <td class="py-3">{data.bestScore} / {data.total}</td>
            <td class="py-3">{data.accuracy}%</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>