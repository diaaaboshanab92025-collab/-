import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Coffee,
  BookOpen,
  Plus,
  Trash2,
  Flame,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TimerViewProps {
  setCurrentTab: (tab: string) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ setCurrentTab }) => {
  const {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
    resetTimer,
    subjects,
    sessions,
    addManualSession,
    deleteSession,
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    timer.subjectId || subjects[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState(timer.chapterId || '');
  const [selectedMode, setSelectedMode] = useState<'pomodoro_25' | 'pomodoro_50' | 'stopwatch'>(
    timer.mode || 'pomodoro_25'
  );
  const [sessionNotes, setSessionNotes] = useState(timer.notes || '');
  const [focusRating, setFocusRating] = useState(5);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual session state
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualMinutes, setManualMinutes] = useState(45);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualNotes, setManualNotes] = useState('');

  const currentSubject = subjects.find((s) => s.id === (timer.subjectId || selectedSubjectId));
  const availableChapters = currentSubject?.chapters || [];

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedSubjectId && subjects.length > 0) {
      startTimer(subjects[0].id, selectedChapterId || undefined, selectedMode);
    } else {
      startTimer(selectedSubjectId, selectedChapterId || undefined, selectedMode);
    }
  };

  const handleFinishSubmit = () => {
    finishTimer(sessionNotes, focusRating);
    setShowFinishConfirm(false);
    setSessionNotes('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMinutes <= 0) return;
    const now = new Date().toISOString();
    addManualSession({
      subjectId: manualSubjectId,
      durationMinutes: Number(manualMinutes),
      date: manualDate,
      startTime: `${manualDate}T10:00:00Z`,
      endTime: `${manualDate}T11:00:00Z`,
      type: 'manual',
      notes: manualNotes.trim() || 'تسجيل يدوي لجلسة مذاكرة سابقة',
      focusRating: 4,
    });
    setShowManualModal(false);
    setManualNotes('');
  };

  // SVG circular progress calculation
  const target = timer.targetSeconds || 25 * 60;
  const progressRatio = timer.mode === 'stopwatch' ? 1 : Math.min(1, timer.secondsElapsed / target);
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TimerIcon className="w-6 h-6 text-emerald-600" />
            <span>مؤقت المذاكرة والتركيز الذكي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            سجل ساعات دراستك الحقيقية، واستخدم تقنية بومودورو الفعالة لإيقاف التشتت.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جلسة سابقة يدوياً</span>
        </button>
      </div>

      {/* Main Timer Display Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {/* Presets / Mode Selector */}
        {!timer.isActive && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedMode('pomodoro_25')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedMode === 'pomodoro_25'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              بومودورو (25 دقيقة)
            </button>
            <button
              onClick={() => setSelectedMode('pomodoro_50')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedMode === 'pomodoro_50'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              تركيز عميق (50 دقيقة)
            </button>
            <button
              onClick={() => setSelectedMode('stopwatch')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedMode === 'stopwatch'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              مؤقت مفتوح (ساعة إيقاف)
            </button>
          </div>
        )}

        {/* Subject & Chapter Selection before starting */}
        {!timer.isActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                اختر المادة المراد مذاكرتها:
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedChapterId('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الفصل أو الدرس (اختياري):
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="">كامل المادة / مراجعة عامة</option>
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Current Active Session Info Pill */}
        {timer.isActive && currentSubject && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 border border-emerald-200 dark:border-emerald-800">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentSubject.color }}
            />
            <span>مذاكرة: {currentSubject.name}</span>
            {timer.isPaused && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px]">
                موقوف مؤقتاً
              </span>
            )}
          </div>
        )}

        {/* Circular SVG Timer Display */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={circleRadius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="140"
              cy="140"
              r={circleRadius}
              className="text-emerald-500 transition-all duration-500"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatTime(timer.secondsElapsed)}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {timer.mode === 'stopwatch'
                ? 'ساعة إيقاف مستمرة'
                : `الهدف: ${Math.round(target / 60)} دقيقة`}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="mt-8 flex items-center gap-3">
          {!timer.isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ابدأ جلسة المذاكرة الآن</span>
            </button>
          ) : (
            <>
              {timer.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>استئناف</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>إيقاف مؤقت</span>
                </button>
              )}

              <button
                onClick={() => setShowFinishConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إنهاء وحفظ الجلسة</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="إلغاء الجلسة"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Finish Session & Notes */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  إنهاء وتوثيق الجلسة الدراسية
                </h3>
                <p className="text-xs text-slate-500">
                  الوقت المستغرق فعلياً: {Math.max(1, Math.round(timer.secondsElapsed / 60))} دقيقة
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ما الذي قمت بإنجازه في هذه الجلسة؟
              </label>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="مثال: حل تدريبات كيرشوف من 1 إلى 20، وفهم قاعدة اليد اليمنى..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تقييم مستوى تركيزك (1 - 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFocusRating(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      focusRating === num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {num} ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                متابعة المذاكرة
              </button>
              <button
                onClick={handleFinishSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                تأكيد وحفظ الجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Session Entry */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4">
              تسجيل جلسة مذاكرة يدوية سابقة
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة
                </label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
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
                    المدة بالدقائق
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو مواضيع تمت مذاكرتها
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="موضوع الجلسة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  حفظ الجلسة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History of Saved Sessions */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
          سجل جلسات المذاكرة المحفوظة
        </h3>

        <div className="space-y-2">
          {sessions.slice(0, 8).map((ses) => {
            const sub = subjects.find((s) => s.id === ses.subjectId);
            return (
              <div
                key={ses.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub?.color || '#10b981' }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {sub?.name || 'مادة عامة'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ses.date}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {ses.type === 'pomodoro' ? 'بومودورو' : ses.type === 'manual' ? 'يدوي' : 'مستمر'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {ses.notes || 'جلسة تركيز'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {ses.durationMinutes} دقيقة
                  </span>
                  <button
                    onClick={() => deleteSession(ses.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                    title="حذف الجلسة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
