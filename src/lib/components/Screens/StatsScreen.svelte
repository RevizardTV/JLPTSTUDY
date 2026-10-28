<script lang="ts">
  import { userProgress, questionSets } from '#lib/stores.js';
  import type { SetProgress } from '#lib/types.js';
  import { SvelteMap } from 'svelte/reactivity';
  import { calculateGlobalStats } from '#lib/utils/statsUtils.js';

  // Compute global stats
  const stats = $derived(calculateGlobalStats($questionSets, $userProgress));

  // Filter completed lists strictly against sets that actually exist in the store using SvelteMap
  const validCompletedMap = $derived(() => {
    const map = new SvelteMap<string, SetProgress>();
    const existingIds = new Set($questionSets.map(s => s.id));
    
    Object.entries($userProgress.completedSets).forEach(([setId, data]) => {
      if (existingIds.has(setId) && data && typeof data === 'object' && 'bestScore' in data) {
        map.set(setId, data as SetProgress);
      }
    });
    return map;
  });

  const completedList = $derived(Array.from(validCompletedMap().entries()));

  // Find sets that haven't been completed yet
  const pendingSets = $derived(
    $questionSets.filter(set => !validCompletedMap().has(set.id))
  );
</script>

<div class="space-y-6 max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Learning Analytics & Category Stats</h2>

  <!-- Metric Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <span class="text-xs text-slate-400 uppercase font-semibold">Quizzes Taken</span>
      <div class="text-3xl font-extrabold text-brand-500 my-2">{$userProgress.totalQuizzes}</div>
    </div>

    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <span class="text-xs text-slate-400 uppercase font-semibold">Questions Completed</span>
      <div class="text-3xl font-extrabold text-emerald-500 my-2">
        {stats.totalQuestionsCompleted} <span class="text-sm font-normal text-slate-400">/ {stats.totalQuestionsAvailable}</span>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <span class="text-xs text-slate-400 uppercase font-semibold">Overall Accuracy</span>
      <div class="text-3xl font-extrabold text-indigo-500 my-2">{stats.overallAccuracy}%</div>
    </div>

    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <span class="text-xs text-slate-400 uppercase font-semibold">Pending Sets</span>
      <div class="text-3xl font-extrabold text-amber-500 my-2">{stats.pendingSetsCount} / {stats.totalSetsCount}</div>
    </div>
  </div>

  <!-- Completed Performance History Table -->
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
    <h3 class="font-bold text-slate-800 dark:text-slate-100">Completed Sets History</h3>
    
    {#if completedList.length === 0}
      <p class="text-xs text-slate-400 py-4 text-center">No valid completed quiz sessions found for active sets.</p>
    {:else}
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
              <td class="py-3 font-bold text-slate-800 dark:text-slate-200">{setId}</td>
              <td class="py-3 text-slate-600 dark:text-slate-300">{data.bestScore} / {data.total}</td>
              <td class="py-3 font-semibold text-brand-500">{data.accuracy}%</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <!-- Sets To Be Completed Section -->
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
    <h3 class="font-bold text-slate-800 dark:text-slate-100">Sets Pending Completion</h3>
    
    {#if pendingSets.length === 0}
      <p class="text-xs text-emerald-500 py-4 text-center font-medium">🎉 Amazing job! You have completed all available question sets.</p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each pendingSets as set (set.id)}
          <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <div>
              <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{set.title}</div>
              <div class="text-[10px] text-slate-400 font-mono">{set.id} • {set.category}</div>
            </div>
            <span class="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg font-semibold">Pending</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>