<script lang="ts">
  import { questionSets } from '#lib/stores.js';
  import type { QuestionSet, CategoryType } from '#lib/types.js';

  let { onclose }: { onclose: () => void } = $props();

  let title = $state<string>('');
  let category = $state<CategoryType>('kanji');
  let contextPassage = $state<string>('');
  let prompt = $state<string>('');
  let opt1 = $state<string>('');
  let opt2 = $state<string>('');
  let opt3 = $state<string>('');
  let opt4 = $state<string>('');
  let correctAnswer = $state<number>(0);
  let kanji = $state<string>('');
  let reading = $state<string>('');

  function handleAddSet() {
    if (!title || !prompt) {
      alert('Please fill in at least the set title and question prompt.');
      return;
    }

    const newSet: QuestionSet = {
      id: `custom-${Date.now()}`,
      title,
      category,
      contextPassages: [contextPassage || prompt],
      questions: [
        {
          qNum: 1,
          prompt,
          contextIdx: 0,
          options: [
            { text: opt1 || 'Option 1', kana: opt1, english: 'N/A' },
            { text: opt2 || 'Option 2', kana: opt2, english: 'N/A' },
            { text: opt3 || 'Option 3', kana: opt3, english: 'N/A' },
            { text: opt4 || 'Option 4', kana: opt4, english: 'N/A' }
          ],
          answer: correctAnswer,
          kanji: kanji || prompt,
          reading: reading || opt1
        }
      ],
      vocab: [
        { word: `${kanji || prompt} (${reading || 'reading'})`, meaning: 'Custom added vocabulary' }
      ]
    };

    questionSets.update((sets) => [...sets, newSet]);
    onclose();
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
    <h3 class="text-xl font-bold">Add Single Question Set</h3>
    <p class="text-xs text-slate-500">Create and instantly append a new exercise set to your library:</p>
    
    <div class="space-y-3 text-xs">
      <div>
        <label for="single-title" class="block font-bold mb-1">Set Title (e.g. EX-20)</label>
        <input id="single-title" type="text" bind:value={title} placeholder="EX-20" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700" />
      </div>

      <div>
        <label for="single-category" class="block font-bold mb-1">Category</label>
        <select id="single-category" bind:value={category} class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700">
          <option value="kanji">Kanji</option>
          <option value="grammar">Grammar</option>
          <option value="reading">Reading</option>
          <option value="vocabulary">Vocabulary</option>
        </select>
      </div>

      <div>
        <label for="single-context" class="block font-bold mb-1">Context Sentence / Passage</label>
        <input id="single-context" type="text" bind:value={contextPassage} placeholder="きょうはがっこうへ行きます。" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700 font-japanese" />
      </div>

      <div>
        <label for="single-prompt" class="block font-bold mb-1">Target Word / Prompt</label>
        <input id="single-prompt" type="text" bind:value={prompt} placeholder="行く" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700 font-japanese" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label for="single-opt1" class="block font-bold mb-1">Option 1 (Correct or Wrong)</label>
          <input id="single-opt1" type="text" bind:value={opt1} placeholder="いく" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700" />
        </div>
        <div>
          <label for="single-opt2" class="block font-bold mb-1">Option 2</label>
          <input id="single-opt2" type="text" bind:value={opt2} placeholder="くる" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700" />
        </div>
        <div>
          <label for="single-opt3" class="block font-bold mb-1">Option 3</label>
          <input id="single-opt3" type="text" bind:value={opt3} placeholder="みる" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700" />
        </div>
        <div>
          <label for="single-opt4" class="block font-bold mb-1">Option 4</label>
          <input id="single-opt4" type="text" bind:value={opt4} placeholder="する" class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700" />
        </div>
      </div>

      <div>
        <label for="single-correct" class="block font-bold mb-1">Correct Option Index (0 to 3)</label>
        <select id="single-correct" bind:value={correctAnswer} class="w-full p-2.5 border rounded-xl dark:bg-slate-900 dark:border-slate-700">
          <option value={0}>Option 1</option>
          <option value={1}>Option 2</option>
          <option value={2}>Option 3</option>
          <option value={3}>Option 4</option>
        </select>
      </div>
    </div>

    <div class="flex justify-end space-x-2 pt-2">
      <button onclick={onclose} class="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
      <button onclick={handleAddSet} class="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl">Create Set</button>
    </div>
  </div>
</div>