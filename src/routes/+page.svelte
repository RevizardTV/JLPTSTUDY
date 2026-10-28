<script lang="ts">
  import '../app.css';
  import Navbar from '#lib/components/Navbar.svelte';
  import Dashboard from '#lib/components/Dashboard.svelte';
  import QuizScreen from '#lib/components/QuizScreen.svelte';
  import SummaryScreen from '#lib/components/SummaryScreen.svelte';
  import VocabScreen from '#lib/components/VocabScreen.svelte';
  import StatsScreen from '#lib/components/StatsScreen.svelte';
  import type { QuizConfig, FinishEventData } from '#lib/types.js';

  let currentScreen = $state<string>('dashboard');
  let quizConfig = $state<QuizConfig>({ mode: 'all', practice: true, timed: false, setId: undefined });
  let quizResultData = $state<FinishEventData | null>(null);

  function handleNavigate(event: { screen: string; config?: QuizConfig }) {
    currentScreen = event.screen;
    if (event.config) {
      quizConfig = event.config;
    }
  }

  function handleFinishQuiz(data: FinishEventData) {
    quizResultData = data;
    currentScreen = 'summary';
  }
</script>

<div class="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
  <Navbar onnavigate={handleNavigate} />

  <main class="grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if currentScreen === 'dashboard'}
      <Dashboard onnavigate={handleNavigate} />
    {:else if currentScreen === 'quiz'}
      <QuizScreen config={quizConfig} onfinish={handleFinishQuiz} onexit={() => currentScreen = 'dashboard'} />
    {:else if currentScreen === 'summary' && quizResultData}
      <SummaryScreen data={quizResultData} onnavigate={handleNavigate} />
    {:else if currentScreen === 'vocab'}
      <VocabScreen />
    {:else if currentScreen === 'stats'}
      <StatsScreen />
    {/if}
  </main>

  <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 mt-8">
    <div class="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
      Japanese Interactive Self-Hosted Web App • Powered by Bun & Svelte
    </div>
  </footer>
</div>