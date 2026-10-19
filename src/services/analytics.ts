import { StudySession, StudyTask, QuizAttempt, Flashcard, Subject } from '../types';

export interface DashboardMetrics {
  todayStudyMinutes: number;
  todayGoalMinutes: number;
  todayGoalProgressPercent: number;
  weekStudyMinutes: number;
  weekGoalMinutes: number;
  weekGoalProgressPercent: number;
  averageDailyMinutes: number;
  completedTasksCount: number;
  totalTasksDueCount: number;
  taskCompletionRate: number;
  flashcardsReviewedCount: number;
  flashcardAccuracy: number;
  quizAccuracy: number;
  streakDays: number;
  studyTimeBySubject: { subjectId: string; subjectName: string; color: string; minutes: number; percent: number }[];
  last7DaysData: { date: string; dayName: string; minutes: number }[];
  previousWeekStudyMinutes: number;
  weekComparisonPercent: number; // positive = increased, negative = decreased
  bestSubject: { name: string; minutes: number } | null;
  suggestedImprovement: string;
}

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getArabicDayName(dateStr: string): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const d = new Date(dateStr + 'T00:00:00');
  return days[d.getDay()];
}

/**
 * Calculate study streak from actual session records
 */
export function calculateStudyStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Extract distinct days with >= 5 minutes study time
  const dayMinutesMap: Record<string, number> = {};
  sessions.forEach((s) => {
    dayMinutesMap[s.date] = (dayMinutesMap[s.date] || 0) + s.durationMinutes;
  });

  const validDays = new Set(
    Object.keys(dayMinutesMap).filter((date) => dayMinutesMap[date] >= 5)
  );

  if (validDays.size === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If didn't study today or yesterday, streak is 0
  let checkDate = new Date(today);
  if (!validDays.has(todayStr)) {
    if (!validDays.has(yesterdayStr)) {
      return 0;
    }
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const curStr = checkDate.toISOString().split('T')[0];
    if (validDays.has(curStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateDashboardMetrics(
  sessions: StudySession[],
  tasks: StudyTask[],
  quizAttempts: QuizAttempt[],
  cards: Flashcard[],
  subjects: Subject[],
  dailyGoalMinutes: number = 120,
  weeklyGoalHours: number = 14
): DashboardMetrics {
  const todayStr = getTodayString();
  const weeklyGoalMinutes = weeklyGoalHours * 60;

  // 1. Today study time
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayStudyMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const todayGoalProgressPercent =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100))
      : 0;

  // 2. Week study time (last 7 days including today)
  const last7Days: { date: string; dayName: string; minutes: number }[] = [];
  let weekStudyMinutes = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const dayMin = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    last7Days.push({
      date: dateStr,
      dayName: getArabicDayName(dateStr),
      minutes: dayMin,
    });
    weekStudyMinutes += dayMin;
  }

  // Previous 7 days for comparison
  let previousWeekStudyMinutes = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter((s) => s.date === dateStr);
    previousWeekStudyMinutes += daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }

  const weekComparisonPercent =
    previousWeekStudyMinutes > 0
      ? Math.round(((weekStudyMinutes - previousWeekStudyMinutes) / previousWeekStudyMinutes) * 100)
      : weekStudyMinutes > 0
      ? 100
      : 0;

  const weekGoalProgressPercent =
    weeklyGoalMinutes > 0
      ? Math.min(100, Math.round((weekStudyMinutes / weeklyGoalMinutes) * 100))
      : 0;

  const averageDailyMinutes = Math.round(weekStudyMinutes / 7);

  // 3. Task completion rate for this week
  const weekStartStr = last7Days[0].date;
  const tasksInPeriod = tasks.filter((t) => t.dueDate >= weekStartStr && t.dueDate <= todayStr);
  const totalTasksDueCount = tasksInPeriod.length;
  const completedTasksCount = tasksInPeriod.filter((t) => t.status === 'completed').length;
  const taskCompletionRate =
    totalTasksDueCount > 0 ? Math.round((completedTasksCount / totalTasksDueCount) * 100) : 0;

  // 4. Flashcard recall accuracy
  let totalCardsReviewed = 0;
  let totalSuccessfulReviews = 0;
  cards.forEach((c) => {
    const total = c.consecutiveSuccesses + c.totalFailures;
    if (total > 0) {
      totalCardsReviewed += total;
      totalSuccessfulReviews += c.consecutiveSuccesses;
    }
  });

  const flashcardAccuracy =
    totalCardsReviewed > 0 ? Math.round((totalSuccessfulReviews / totalCardsReviewed) * 100) : 0;

  // 5. Quiz performance
  let totalQuizQuestions = 0;
  let totalQuizCorrect = 0;
  quizAttempts.forEach((qa) => {
    totalQuizQuestions += qa.totalQuestions;
    totalQuizCorrect += qa.score;
  });

  const quizAccuracy =
    totalQuizQuestions > 0 ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100) : 0;

  // 6. Study time by subject
  const subjectTimeMap: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectTimeMap[s.subjectId] = (subjectTimeMap[s.subjectId] || 0) + s.durationMinutes;
  });

  const totalSubjectMinutes = Object.values(subjectTimeMap).reduce((a, b) => a + b, 0);
  const studyTimeBySubject = Object.entries(subjectTimeMap)
    .map(([subId, minutes]) => {
      const sub = subjects.find((s) => s.id === subId);
      return {
        subjectId: subId,
        subjectName: sub ? sub.name : 'مادة عامة',
        color: sub?.color || '#3b82f6',
        minutes,
        percent: totalSubjectMinutes > 0 ? Math.round((minutes / totalSubjectMinutes) * 100) : 0,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  // 7. Best subject
  const bestSubject =
    studyTimeBySubject.length > 0
      ? { name: studyTimeBySubject[0].subjectName, minutes: studyTimeBySubject[0].minutes }
      : null;

  // 8. Streak
  const streakDays = calculateStudyStreak(sessions);

  // 9. Suggested actionable improvement
  let suggestedImprovement = 'ابدأ أول جلسة دراسية اليوم لتثبيت جدول مذاكرتك.';
  if (todayStudyMinutes < dailyGoalMinutes * 0.5) {
    suggestedImprovement = `تبقى لديك ${dailyGoalMinutes - todayStudyMinutes} دقيقة للوصول لهدف اليوم. جلسة بومودورو (25 دقيقة) ستقربك كثيراً!`;
  } else if (taskCompletionRate < 60 && totalTasksDueCount > 0) {
    suggestedImprovement = 'لديك مهام متأخرة هذا الأسبوع. قسّم المهام الكبيرة إلى مهام فرعية صغيرة لتسهيل إنجازها.';
  } else if (flashcardAccuracy > 0 && flashcardAccuracy < 70) {
    suggestedImprovement = 'دقة استذكار البطاقات أقل من 70%. جرب مراجعة البطاقات الصعبة بفاصل زمني أقصر لترسيخها.';
  } else if (weekStudyMinutes >= weeklyGoalMinutes) {
    suggestedImprovement = 'أداء رائع! لقد حققت هدفك الأسبوعي. خذ قسطاً كافياً من الراحة للحفاظ على تركيزك العالي.';
  } else {
    suggestedImprovement = 'حافظ على وتيرتك المنتظمة وتجنب تأجيل مراجعة الفصول الصعبة لليلة الامتحان.';
  }

  return {
    todayStudyMinutes,
    todayGoalMinutes: dailyGoalMinutes,
    todayGoalProgressPercent,
    weekStudyMinutes,
    weekGoalMinutes: weeklyGoalMinutes,
    weekGoalProgressPercent,
    averageDailyMinutes,
    completedTasksCount,
    totalTasksDueCount,
    taskCompletionRate,
    flashcardsReviewedCount: totalCardsReviewed,
    flashcardAccuracy,
    quizAccuracy,
    streakDays,
    studyTimeBySubject,
    last7DaysData: last7Days,
    previousWeekStudyMinutes,
    weekComparisonPercent,
    bestSubject,
    suggestedImprovement,
  };
}
