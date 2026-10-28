import type { QuestionSet, UserProgressData, SetProgress } from '#lib/types.js';

export interface GlobalStats {
  totalSetsCount: number;
  totalQuestionsAvailable: number;
  totalQuestionsCompleted: number;
  overallAccuracy: number;
  completedSetsCount: number;
  pendingSetsCount: number;
}

export function calculateGlobalStats(
  questionSets: QuestionSet[],
  progress: UserProgressData
): GlobalStats {
  const totalSetsCount = questionSets.length;
  
  const totalQuestionsAvailable = questionSets.reduce(
    (acc, set) => acc + (set.questions?.length || 0), 
    0
  );

  let totalQuestionsCompleted = 0;
  let weightedScoreSum = 0;
  let totalPossibleSum = 0;
  let completedSetsCount = 0;

  // Only count progress for sets that currently exist in questionSets
  const existingSetIds = new Set(questionSets.map(s => s.id));

  const completedEntries = Object.entries(progress.completedSets || {});
  completedEntries.forEach(([setId, entry]) => {
    if (existingSetIds.has(setId) && entry && typeof entry === 'object' && 'bestScore' in entry) {
      completedSetsCount++;
      const setProg = entry as SetProgress;
      totalQuestionsCompleted += setProg.bestScore || 0;
      weightedScoreSum += setProg.bestScore || 0;
      totalPossibleSum += setProg.total || 0;
    }
  });

  const overallAccuracy = 
    totalPossibleSum > 0 ? Math.round((weightedScoreSum / totalPossibleSum) * 100) : 0;

  const pendingSetsCount = Math.max(0, totalSetsCount - completedSetsCount);

  return {
    totalSetsCount,
    totalQuestionsAvailable,
    totalQuestionsCompleted,
    overallAccuracy,
    completedSetsCount,
    pendingSetsCount,
  };
}