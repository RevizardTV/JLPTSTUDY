<script lang="ts">
	let {
		isOpen = false,
		selectedKana = '',
		onSelect,
		onClose
	}: {
		isOpen: boolean;
		selectedKana: string;
		onSelect: (kana: string) => void;
		onClose: () => void;
	} = $props();

	// Standard Hiragana Gojūon rows (Row-major: A, Ka, Sa, Ta, Na, Ha, Ma, Ya, Ra, Wa, N)
	const kanaRows = [
		[
			{ kana: 'あ', romaji: 'a' },
			{ kana: 'い', romaji: 'i' },
			{ kana: 'う', romaji: 'u' },
			{ kana: 'え', romaji: 'e' },
			{ kana: 'お', romaji: 'o' }
		],
		[
			{ kana: 'か', romaji: 'ka' },
			{ kana: 'き', romaji: 'ki' },
			{ kana: 'く', romaji: 'ku' },
			{ kana: 'け', romaji: 'ke' },
			{ kana: 'こ', romaji: 'ko' }
		],
		[
			{ kana: 'さ', romaji: 'sa' },
			{ kana: 'し', romaji: 'shi' },
			{ kana: 'す', romaji: 'su' },
			{ kana: 'せ', romaji: 'se' },
			{ kana: 'そ', romaji: 'so' }
		],
		[
			{ kana: 'た', romaji: 'ta' },
			{ kana: 'ち', romaji: 'chi' },
			{ kana: 'つ', romaji: 'tsu' },
			{ kana: 'て', romaji: 'te' },
			{ kana: 'と', romaji: 'to' }
		],
		[
			{ kana: 'な', romaji: 'na' },
			{ kana: 'に', romaji: 'ni' },
			{ kana: 'ぬ', romaji: 'nu' },
			{ kana: 'ね', romaji: 'ne' },
			{ kana: 'の', romaji: 'no' }
		],
		[
			{ kana: 'は', romaji: 'ha' },
			{ kana: 'ひ', romaji: 'hi' },
			{ kana: 'ふ', romaji: 'fu' },
			{ kana: 'へ', romaji: 'he' },
			{ kana: 'ほ', romaji: 'ho' }
		],
		[
			{ kana: 'ま', romaji: 'ma' },
			{ kana: 'み', romaji: 'mi' },
			{ kana: 'む', romaji: 'mu' },
			{ kana: 'め', romaji: 'me' },
			{ kana: 'も', romaji: 'mo' }
		],
		[
			{ kana: 'や', romaji: 'ya' },
			{ kana: null, romaji: '' },
			{ kana: 'ゆ', romaji: 'yu' },
			{ kana: null, romaji: '' },
			{ kana: 'よ', romaji: 'yo' }
		],
		[
			{ kana: 'ら', romaji: 'ra' },
			{ kana: 'り', romaji: 'ri' },
			{ kana: 'る', romaji: 'ru' },
			{ kana: 'れ', romaji: 're' },
			{ kana: 'ろ', romaji: 'ro' }
		],
		[
			{ kana: 'わ', romaji: 'wa' },
			{ kana: null, romaji: '' },
			{ kana: null, romaji: '' },
			{ kana: null, romaji: '' },
			{ kana: 'を', romaji: 'wo' }
		],
		[
			{ kana: 'ん', romaji: 'n' },
			{ kana: null, romaji: '' },
			{ kana: null, romaji: '' },
			{ kana: null, romaji: '' },
			{ kana: null, romaji: '' }
		]
	];
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
		<div
			class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-fadeIn"
		>
			<div
				class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"
			>
				<div>
					<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 font-japanese">
						ひらがな Filter
					</h3>
					<p class="text-xs text-slate-400">Select a starting kana character</p>
				</div>
				<button
					onclick={onClose}
					class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
				>
					✕
				</button>
			</div>

			<!-- Clear Filter Option -->
			<button
				onclick={() => {
					onSelect('');
					onClose();
				}}
				class="w-full py-2 px-3 text-sm font-medium rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
			>
				Show All (Clear Filter)
			</button>

			<!-- Kana Grid Chart with keys on both #each loops -->
			<div class="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
				{#each kanaRows as row, rowIdx (rowIdx)}
					{#each row as item, colIdx (item.kana ?? `empty-${rowIdx}-${colIdx}`)}
						{#if item.kana}
							<button
								onclick={() => {
									onSelect(item.kana!);
									onClose();
								}}
								class="h-12 flex flex-col items-center justify-center rounded-xl border transition
									{selectedKana === item.kana
									? 'bg-brand-500 border-brand-600 text-white shadow-md'
									: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-400 hover:bg-brand-50/40'}"
							>
								<span class="font-japanese text-lg font-bold leading-none">{item.kana}</span>
								<span class="text-[9px] text-slate-400 uppercase">{item.romaji}</span>
							</button>
						{:else}
							<div class="h-12"></div>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
	</div>
{/if}
