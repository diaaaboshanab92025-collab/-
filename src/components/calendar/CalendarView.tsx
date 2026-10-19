import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ExamEvent } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface CalendarViewProps {
  setCurrentTab: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ setCurrentTab }) => {
  const { exams, tasks, subjects, addExam, deleteExam, addToast } = useStudy();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddExamModal, setShowAddExamModal] = useState(false);

  // Add exam form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:00');
  const [chaptersInput, setChaptersInput] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [revisionPlan, setRevisionPlan] = useState('');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNamesArabic = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examDate) return;

    const chapters = chaptersInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    addExam({
      title: title.trim(),
      subjectId,
      examDate,
      examTime,
      includedChapters: chapters,
      confidenceLevel,
      revisionPlan: revisionPlan.trim() || undefined,
    });

    setTitle('');
    setExamDate('');
    setChaptersInput('');
    setRevisionPlan('');
    setShowAddExamModal(false);
  };

  const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-rose-500" />
            <span>التقويم الدراسي والعد التنازلي للامتحانات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تابع مواعيد الاختبارات الرسمية والمهام، واحصل على جدول مراجعة تلقائي.
          </p>
        </div>

        <button
          onClick={() => setShowAddExamModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة موعد امتحان جديد</span>
        </button>
      </div>

      {/* Upcoming Exams Countdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>الامتحانات القادمة والخطط المقترحة:</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const sub = subjects.find((s) => s.id === exam.subjectId);
            const daysLeft = Math.ceil(
              (new Date(exam.examDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: sub?.color || '#ef4444' }}
                    >
                      {sub?.name || 'مادة عامة'}
                    </span>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                    {exam.title}
                  </h3>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="text-center px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block font-mono">
                        {daysLeft <= 0 ? 'اليوم' : daysLeft}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                        {daysLeft <= 0 ? 'موفق!' : 'أيام متبقية'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1 font-mono">
                        <CalendarIcon className="w-3.5 h-3.5" /> {exam.examDate}
                      </p>
                      {exam.examTime && (
                        <p className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {exam.examTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {exam.revisionPlan && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        خطة المراجعة:
                      </span>
                      {exam.revisionPlan}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">مستوى الاستعداد:</span>
                  <span
                    className={`font-bold ${
                      exam.confidenceLevel === 'high'
                        ? 'text-emerald-600'
                        : exam.confidenceLevel === 'medium'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {exam.confidenceLevel === 'high'
                      ? 'مرتفع واثق'
                      : exam.confidenceLevel === 'medium'
                      ? 'متوسط'
                      : 'يحتاج تكثيف'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Interactive Calendar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {monthNamesArabic[month]} {year}
            </h3>
            <span className="text-xs text-slate-400">الجدول الشهري الموحد</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="الشهر السابق"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="الشهر القادم"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysArabic.map((day) => (
            <div
              key={day}
              className="text-center py-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl"
            >
              {day}
            </div>
          ))}

          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={'empty_' + i} className="min-h-[80px] p-1 rounded-2xl bg-transparent" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            const dayExams = exams.filter((e) => e.examDate === dateStr);
            const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

            return (
              <div
                key={dayNum}
                className={`min-h-[80px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black ${
                      isToday
                        ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="اليوم" />
                  )}
                </div>

                <div className="space-y-1 my-1">
                  {dayExams.map((ex) => (
                    <div
                      key={ex.id}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 truncate"
                      title={ex.title}
                    >
                      امتحان: {ex.title}
                    </div>
                  ))}
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 truncate"
                      title={t.title}
                    >
                      مهمة: {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddExamModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              جدولة موعد امتحان جديد
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الامتحان *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: امتحان الفيزياء الشهري على الكهربية..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة المرتبطة
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الامتحان *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ساعة الامتحان
                  </label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الفصول المشمولة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={chaptersInput}
                  onChange={(e) => setChaptersInput(e.target.value)}
                  placeholder="الفصل الأول, الفصل الثاني"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مستوى ثقتك الحالي
                </label>
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                >
                  <option value="high">مرتفع (مستعد وجاهز)</option>
                  <option value="medium">متوسط (يحتاج حل نماذج)</option>
                  <option value="low">منخفض (يحتاج إعادة مذاكرة مكثفة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  خطة المراجعة الشخصية
                </label>
                <textarea
                  rows={2}
                  value={revisionPlan}
                  onChange={(e) => setRevisionPlan(e.target.value)}
                  placeholder="خطة توزيع المراجعة قبل الامتحان..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  حفظ موعد الامتحان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
