<script lang="ts">
	import type { ListeningQuestionItem } from '#lib/types/listening.ts';
	import { transcribeAllItems } from '#lib/utils/transcribeHelper.ts';

	let audioItems = $state<ListeningQuestionItem[]>([]);
	let isBatchProcessing = $state(false);

	// Transcribe just one clicked item

	// Transcribe every audio file uploaded in the modal automatically
	async function handleBatchTranscribe() {
		isBatchProcessing = true;
		await transcribeAllItems(audioItems);
		isBatchProcessing = false;
	}
</script>

<!-- Example UI Button to batch process everything -->
{#if audioItems.length > 0}
	<button
		onclick={handleBatchTranscribe}
		disabled={isBatchProcessing}
		class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
	>
		{isBatchProcessing ? 'Transcribing All Tracks...' : 'Auto-Transcribe All Audios'}
	</button>
{/if}
