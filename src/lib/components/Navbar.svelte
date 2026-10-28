<script lang="ts">
  let { onnavigate }: { onnavigate: (event: { screen: string }) => void } = $props();

  let isDark = $state<boolean>(false);

  function toggleTheme() {
    isDark = !isDark;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }

  function nav(screen: string) {
    onnavigate({ screen });
  }
</script>

<header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 transition-colors">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <button onclick={() => nav('dashboard')} class="flex items-center space-x-3 text-left">
      <div class="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500 to-rose-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
        漢
      </div>
      <div>
        <h1 class="font-bold text-lg leading-tight tracking-tight text-slate-800 dark:text-slate-100">Kanji Master N5-N4</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">Interactive Japanese Study Platform</p>
      </div>
    </button>

    <div class="flex items-center space-x-2 sm:space-x-4">
      <button onclick={toggleTheme} class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition" aria-label="Toggle Theme">
        {#if isDark}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.03 9.03 0 0012 21a9.03 9.03 0 008.354-5.646z"></path></svg>
        {/if}
      </button>

      <button onclick={() => nav('stats')} class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <span class="hidden sm:inline">Stats</span>
      </button>

      <button onclick={() => nav('vocab')} class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        <span class="hidden sm:inline">Vocab</span>
      </button>
    </div>
  </div>
</header>