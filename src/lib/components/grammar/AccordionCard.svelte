<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		badge,
		children
	}: {
		title: string;
		subtitle: string;
		badge?: string;
		children: Snippet;
	} = $props();

	let isOpen = $state<boolean>(false);
</script>

<div
	class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
>
	<!-- Top Bar (Verb header box) -->
	<button
		onclick={() => (isOpen = !isOpen)}
		class="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
	>
		<div class="space-y-1">
			{#if badge}
				<span
					class="px-2.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[10px] rounded-full uppercase"
				>
					{badge}
				</span>
			{/if}
			<h3 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-japanese">
				{title}
			</h3>
			<p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>
		</div>

		<div class="flex items-center space-x-2 text-xs font-bold text-brand-500">
			<span>{isOpen ? 'Hide Tenses' : 'View Tenses'}</span>
			<svg
				class="w-5 h-5 transform transition-transform {isOpen ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</button>

	<!-- Accordion Content (Tenses and Forms box) -->
	{#if isOpen}
		<div
			class="p-5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 animate-fadeIn"
		>
			{@render children()}
		</div>
	{/if}
</div>
