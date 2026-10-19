import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import {
  Timer,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  BarChart2,
  Calendar,
  Flame,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Play,
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
  onOpenAddTask?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab, onOpenAddTask }) => {
  const { user } = useAuth();
  const { metrics, sessions, summaries, tasks, exams, subjects, startTimer } = useStudy();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  const todayArabicDate = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Next upcoming exam
  const upcomingExams = exams
    .filter((e) => {
      const todayStr = new Date().toISOString().split('T')[0];
      return e.examDate >= todayStr;
    })
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  const nextExam = upcomingExams[0];
  const daysUntilNextExam = nextExam
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextExam.examDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Max minutes for SVG bar chart scaling
  const maxDayMinutes = Math.max(...metrics.last7DaysData.map((d) => d.minutes), 60);

  // Quick start a timer session on first subject
  const handleQuickStudy = () => {
    if (subjects.length > 0) {
      startTimer(subjects[0].id);
      setCurrentTab('timer');
    } else {
      setCurrentTab('subjects');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium backdrop-blur-xs">
                {todayArabicDate}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{metrics.streakDays} أيام حماس متتالية</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              أهلاً بك يا {user?.name || 'طالب العلم'} 👋
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
              {metrics.suggestedImprovement}
            </p>
          </div>

          {/* Quick exam countdown pill */}
          {nextExam && daysUntilNextExam !== null && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 max-w-sm">
              <div className="flex items-center gap-2 text-xs text-emerald-200 mb-1">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>الامتحان القادم:</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{nextExam.title}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-2xl font-black text-amber-300">
                  {daysUntilNextExam === 0 ? 'اليوم!' : `${daysUntilNextExam} يوم`}
                </span>
                <button
                  onClick={() => setCurrentTab('calendar')}
                  className="text-xs text-white/90 underline hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  خطة المراجعة <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Daily Study Goal Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/15">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium mb-2">
            <span>هدف المذاكرة اليومي:</span>
            <span className="font-bold">
              {metrics.todayStudyMinutes} دقيقة مكتملة من أصل {metrics.todayGoalMinutes} دقيقة (
              {metrics.todayGoalProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, metrics.todayGoalProgressPercent)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-200/90">
            <span>المهام المنجزة اليوم: {metrics.completedTasksCount} مهام</span>
            <span>المتبقي للهدف: {Math.max(0, metrics.todayGoalMinutes - metrics.todayStudyMinutes)} دقيقة</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>إجراءات سريعة</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            onClick={handleQuickStudy}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-xs font-bold">ابدأ جلسة</span>
            <span className="text-[10px] text-emerald-100">بومودورو / تركيز</span>
          </button>

          <button
            onClick={onOpenAddTask || (() => setCurrentTab('tasks'))}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">إضافة مهمة</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">جدول مذاكرة</span>
          </button>

          <button
            onClick={() => setCurrentTab('summaries')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">توليد تلخيص</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setCurrentTab('flashcards')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">مراجعة البطاقات</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">تكرار متباعد</span>
          </button>

          <button
            onClick={() => setCurrentTab('tutor')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">المعلم الذكي</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">شرح فوري</span>
          </button>

          <button
            onClick={() => setCurrentTab('quizzes')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">اختبار تجريبي</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">قياس الفهم</span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">التقرير الأسبوعي</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">إحصاءات دقيقة</span>
          </button>
        </div>
      </div>

      {/* 3. Progress Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Study Time */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              وقت المذاكرة اليوم
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.todayStudyMinutes} <span className="text-xs font-normal text-slate-500">دقيقة</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              {metrics.todayGoalProgressPercent}% من الهدف اليومي
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Timer className="w-6 h-6" />
          </div>
        </div>

        {/* Weekly Study Time */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              إجمالي الأسبوع
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics.weekStudyMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-slate-500">ساعة</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              معدل {metrics.averageDailyMinutes} دقيقة / يوم
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              إنجاز المهام الدراسية
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.taskCompletionRate}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {metrics.completedTasksCount} مكتملة من {metrics.totalTasksDueCount} مهمة مستحقة
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Quiz Accuracy & Flashcards */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              دقة الاستذكار والاختبارات
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.flashcardAccuracy > 0 ? `${metrics.flashcardAccuracy}%` : 'لا توجد بيانات'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {metrics.flashcardsReviewedCount} بطاقة تمت مراجعتها
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Charts: 7-Day Study Trend + Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                ساعات المذاكرة خلال آخر 7 أيام
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تسجيل فعلي للجلسات المنجزة بالدقائق
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('reports')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              التقرير المفصل <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {metrics.last7DaysData.map((d, idx) => {
              const heightPercent = Math.max(8, Math.round((d.minutes / maxDayMinutes) * 100));
              const isToday = idx === metrics.last7DaysData.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes} د
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${isToday ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Time By Subject */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              توزيع الوقت حسب المادة
            </h3>
            <button
              onClick={() => setCurrentTab('subjects')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              عرض الكل
            </button>
          </div>

          {metrics.studyTimeBySubject.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              لم تسجل جلسات بعد. ابدأ جلسة بومودورو لترى توزيعك الزمني!
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {metrics.studyTimeBySubject.slice(0, 5).map((item) => (
                <div key={item.subjectId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.subjectName}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.minutes} دقيقة ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {metrics.bestSubject && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">المادة الأكثر إنجازاً:</span> {metrics.bestSubject.name} بمجموع{' '}
              {metrics.bestSubject.minutes} دقيقة.
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Study Sessions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-600" />
              <span>آخر جلسات المذاكرة المسجلة</span>
            </h3>
            <button
              onClick={() => setCurrentTab('timer')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              جلسة جديدة
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              لا توجد جلسات مسجلة بعد.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.slice(0, 4).map((ses) => {
                const sub = subjects.find((s) => s.id === ses.subjectId);
                return (
                  <div
                    key={ses.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub?.color || '#10b981' }}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {sub?.name || 'مادة دراسية'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ses.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {ses.notes || 'جلسة تركيز'}
                      </p>
                    </div>
                    <div className="text-left font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      +{ses.durationMinutes} دقيقة
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Tasks & Deadlines */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>المهام القادمة والمستحقة</span>
            </h3>
            <button
              onClick={() => setCurrentTab('tasks')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              عرض المخطط
            </button>
          </div>

          {tasks.filter((t) => t.status !== 'completed').length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-600 font-medium">
              🎉 رائع! لا توجد مهام متأخرة حالياً، جميع مهامك مكتملة.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.status !== 'completed')
                .slice(0, 4)
                .map((task) => {
                  const sub = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{sub?.name}</span>
                          <span>•</span>
                          <span>الموعد: {task.dueDate}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.priority === 'high' ? 'أولوية قصوى' : 'عادية'}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
