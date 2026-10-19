import { Flashcard } from '../types';

export type Rating = 0 | 1 | 2 | 3; // 0: Again, 1: Hard, 2: Good, 3: Easy

export interface ScheduleResult {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string; // YYYY-MM-DD
  consecutiveSuccesses: number;
  totalFailures: number;
}

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 */
export function calculateNextReview(card: Flashcard, rating: Rating): ScheduleResult {
  let { repetitions, intervalDays, easeFactor, consecutiveSuccesses, totalFailures } = card;

  // Rating 0 = Fail / Again
  if (rating === 0) {
    repetitions = 0;
    intervalDays = 1;
    totalFailures += 1;
    consecutiveSuccesses = 0;
    // slightly decrease ease factor
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Success: Hard (1), Good (2), Easy (3)
    consecutiveSuccesses += 1;

    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = rating === 1 ? 3 : 6;
    } else {
      let multiplier = easeFactor;
      if (rating === 1) multiplier *= 0.85; // Hard
      if (rating === 3) multiplier *= 1.3; // Easy bonus
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * multiplier));
    }

    repetitions += 1;

    // Adjust ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // mapping 1->3, 2->4, 3->5 on standard 5-point scale
    const q = rating === 1 ? 3 : rating === 2 ? 4 : 5;
    const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    easeFactor = Math.max(1.3, easeFactor + delta);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewDate,
    consecutiveSuccesses,
    totalFailures,
  };
}

export function isCardDue(card: Flashcard): boolean {
  const today = new Date().toISOString().split('T')[0];
  return card.nextReviewDate <= today;
}
