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
  let touchedSetsCount = 0;

  // Only count progress for sets that currently exist in questionSets
  const existingSetIds = new Set(questionSets.map(s => s.id));

  const progressEntries = Object.entries(progress.completedSets || {});
  progressEntries.forEach(([setId, entry]) => {
    if (existingSetIds.has(setId) && entry && typeof entry === 'object') {
      const setProg = entry as SetProgress;
      
      const attempted = setProg.attemptedCount || (setProg.userAnswers ? setProg.userAnswers.length : 0);
      if (attempted > 0) {
        touchedSetsCount++;
      }

      if (setProg.bestScore !== undefined && setProg.total !== undefined && setProg.bestScore === setProg.total) {
        completedSetsCount++;
      }

      totalQuestionsCompleted += attempted;
      weightedScoreSum += setProg.bestScore || 0;
      totalPossibleSum += setProg.total || 0;
    }
  });

  const overallAccuracy = 
    totalPossibleSum > 0 ? Math.round((weightedScoreSum / totalPossibleSum) * 100) : 0;

  const pendingSetsCount = Math.max(0, totalSetsCount - touchedSetsCount);

  return {
    totalSetsCount,
    totalQuestionsAvailable,
    totalQuestionsCompleted,
    overallAccuracy,
    completedSetsCount,
    pendingSetsCount,
  };
}