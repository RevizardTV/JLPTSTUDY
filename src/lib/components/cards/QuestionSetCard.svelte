<script lang="ts">
  import type { QuestionSet, QuizConfig, SetProgress, UserAnswer } from '#lib/types.js';
  import { resetSetProgress } from '#lib/stores.js';

  let { 
    set, 
    progress, 
    onstart, 
    ondelete 
  }: {
    set: QuestionSet;
    progress?: SetProgress | boolean;
    onstart: (config: QuizConfig) => void;
    ondelete: (setId: string, title: string) => void;
  } = $props();

  const stats = $derived(
    typeof progress === 'object' && progress !== null ? (progress as SetProgress) : null
  );

  const totalQuestions = $derived(set.questions.length);
  const attemptedCount = $derived(stats?.attemptedCount || (stats?.userAnswers ? stats.userAnswers.length : 0));
  const correctCount = $derived(
    stats?.bestScore !== undefined ? stats.bestScore : (stats?.userAnswers ? stats.userAnswers.filter((a: UserAnswer) => a.isCorrect).length : 0)
  );
  const incorrectCount = $derived(Math.max(0, attemptedCount - correctCount));

  // Segment widths relative to total questions
  const correctPercent = $derived(totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0);
  const incorrectPercent = $derived(totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0);

  const hasMistakes = $derived(incorrectCount > 0);

  const statusBadge = $derived.by(() => {
    if (!stats || attemptedCount === 0) {
      return { label: 'Pending', bg: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' };
    }
    if (correctCount === totalQuestions && !hasMistakes) {
      return { label: 'Completed (100%)', bg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' };
    }
    if (hasMistakes) {
      return { label: 'Work Required', bg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' };
    }
    const progressPct = Math.round((attemptedCount / totalQuestions) * 100);
    return { label: `In Progress (${progressPct}%)`, bg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' };
  });

  function handleReset() {
    if (confirm(`Are you sure you want to reset progress for "${set.title}"?`)) {
      resetSetProgress(set.id);
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl border p-5 transition hover:shadow-lg flex flex-col justify-between border-slate-200 dark:border-slate-700 space-y-4">
  <div>
    <!-- Category & Status Header -->
    <div class="flex justify-between items-center mb-3 gap-2">
      <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-brand-600 dark:text-brand-400 capitalize tracking-wide">
        {set.category || 'kanji'}
      </span>

      <div class="flex items-center space-x-1.5">
        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize {statusBadge.bg}">
          {statusBadge.label}
        </span>
        
        {#if stats}
          <button 
            onclick={handleReset} 
            title="Reset Progress"
            class="text-slate-400 hover:text-amber-500 transition p-1 rounded-md hover:bg-amber-500/10 text-xs">
            🔄
          </button>
        {/if}

        <button 
          onclick={() => ondelete(set.id, set.title)} 
          title="Delete Set"
          class="text-slate-400 hover:text-red-500 transition p-1 rounded-md hover:bg-red-500/10 text-xs">
          🗑️
        </button>
      </div>
    </div>
    
    <h4 class="font-extrabold text-xl text-slate-900 dark:text-slate-100 mb-2">{set.title}</h4>

    <!-- Detailed Metrics Breakdown -->
    <div class="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 space-y-2 mb-3">
      <div class="flex items-center justify-between text-xs font-medium">
        <span class="text-slate-500 dark:text-slate-400">Attempted: <strong class="text-slate-800 dark:text-slate-200">{attemptedCount} / {totalQuestions}</strong></span>
        <div class="flex items-center space-x-3">
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Correct: {correctCount}</span>
          <span class="text-rose-600 dark:text-rose-400 font-semibold">✕ Incorrect: {incorrectCount}</span>
        </div>
      </div>

      <!-- Split Multi-Colored Progress Bar (Green for correct, Red for incorrect) -->
      <div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
        {#if correctPercent > 0}
          <div class="bg-emerald-500 h-full transition-all duration-300" style="width: {correctPercent}%"></div>
        {/if}
        {#if incorrectPercent > 0}
          <div class="bg-rose-500 h-full transition-all duration-300" style="width: {incorrectPercent}%"></div>
        {/if}
      </div>
    </div>

    <!-- Pack & Tags Badges -->
    <div class="flex flex-wrap gap-1.5 mt-2">
      {#if set.packTitle}
        <span class="text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 font-semibold">
          📦 {set.packTitle}
        </span>
      {/if}
      {#if set.tags && set.tags.length > 0}
        {#each set.tags as tag (tag)}
          <span class="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 font-medium">
            #{tag}
          </span>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex space-x-2">
    <button 
      onclick={() => onstart({ mode: 'exercise', setId: set.id, practice: true })} 
      class="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5">
      <span>✏️</span>
      <span>{stats && stats.currentIndex !== undefined && stats.currentIndex > 0 && attemptedCount < totalQuestions ? 'Resume' : 'Practice'}</span>
    </button>
    <button 
      onclick={() => onstart({ mode: 'exercise', setId: set.id, practice: false, timed: true })} 
      class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5">
      <span>⏱️</span>
      <span>Timed</span>
    </button>
  </div>
</div>