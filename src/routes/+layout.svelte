<script lang="ts">
	import Navbar from '#lib/components/buttons/Navbar.svelte'; // Adjust path if your Navbar is located elsewhere
	import '../app.css';

	let { children } = $props();
</script>

<div
	class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
>
	<Navbar />

	<main>
		{@render children()}
	</main>
</div>
