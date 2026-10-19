import React from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Layers,
  HelpCircle,
  Award,
  Calendar,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface ReportsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = () => {
  const { metrics, subjects, sessions, tasks } = useStudy();

  const maxDayMinutes = Math.max(...metrics.last7DaysData.map((d) => d.minutes), 60);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <span>تقارير الإنجاز والأداء الأكاديمي</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          تحليل شفاف ومفصل لساعات دراستك الحقيقية، دقة استذكار البطاقات، ونسب إنجاز الأهداف.
        </p>
      </div>

      {/* Goal completion highlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-200">
              ملخص إنجاز الأسبوع الجاري:
            </span>
            <h2 className="text-2xl font-black mt-1">
              {(metrics.weekStudyMinutes / 60).toFixed(1)} ساعة مذاكرة فعلية
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              مقارنة بالأسبوع السابق:{' '}
              <span className="font-bold">
                {metrics.weekComparisonPercent >= 0 ? `+${metrics.weekComparisonPercent}%` : `${metrics.weekComparisonPercent}%`}
              </span>
            </p>
          </div>

          <div className="text-right sm:text-left bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-xs text-emerald-200 block">نسبة تحقيق الهدف الأسبوعي</span>
            <span className="text-3xl font-black text-white">{metrics.weekGoalProgressPercent}%</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-500"
            style={{ width: `${metrics.weekGoalProgressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Separate Pillar Metrics (distinguishing study time, tasks, flashcards, quizzes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Study Time */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">1. وقت المذاكرة</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.todayStudyMinutes} دقيقة اليوم
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            معدل أسبوعي: {metrics.averageDailyMinutes} دقيقة/يوم. (يستبعد أي وقت أثناء التوقف المؤقت).
          </p>
        </div>

        {/* Pillar 2: Task Completion */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">2. إنجاز المهام</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.taskCompletionRate}%
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {metrics.completedTasksCount} مهمة مكتملة من إجمالي {metrics.totalTasksDueCount} مستحقة.
          </p>
        </div>

        {/* Pillar 3: Flashcard Recall */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">3. دقة استرجاع البطاقات</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.flashcardAccuracy > 0 ? `${metrics.flashcardAccuracy}%` : 'لا توجد بيانات'}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            بناءً على التقييم الفعلي (جيد / سهل) وفق خوارزمية SM-2.
          </p>
        </div>

        {/* Pillar 4: Quiz Accuracy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">4. دقة الاختبارات</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.quizAccuracy > 0 ? `${metrics.quizAccuracy}%` : 'لا توجد بيانات'}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            نسبة الإجابات الصحيحة في الاختبارات التجريبية المقاسة.
          </p>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          منحنى المذاكرة اليومي خلال الأيام الـ 7 الماضية
        </h3>

        <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2">
          {metrics.last7DaysData.map((d, idx) => {
            const heightPercent = Math.max(8, Math.round((d.minutes / maxDayMinutes) * 100));
            const isToday = idx === metrics.last7DaysData.length - 1;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {d.minutes} د
                </span>
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-2xl overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full rounded-t-2xl transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Actionable Improvement */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            توصية الأسبوع لتحسين مستواك:
          </h4>
          <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            {metrics.suggestedImprovement}
          </p>
        </div>
      </div>
    </div>
  );
};
