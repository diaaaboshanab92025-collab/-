import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Subject, Chapter } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Circle,
  Layers,
  FileText,
  HelpCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Clock,
} from 'lucide-react';

interface SubjectsViewProps {
  setCurrentTab: (tab: string) => void;
  onSelectSubjectForTimer?: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ setCurrentTab }) => {
  const { subjects, addSubject, updateSubject, deleteSubject, addChapter, toggleChapterComplete } =
    useStudy();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [activeSubjectForNewChapter, setActiveSubjectForNewChapter] = useState<string | null>(null);

  // New subject form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');
  const [targetHoursWeekly, setTargetHoursWeekly] = useState(4);

  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#ef4444', // red
    '#64748b', // slate
  ];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      color,
      icon: 'BookOpen',
      targetHoursWeekly: Number(targetHoursWeekly) || 3,
      chapters: [
        {
          id: 'ch_' + Date.now(),
          title: 'الفصل الأول: المقدمة والمفاهيم التأسيسية',
          order: 1,
          isCompleted: false,
          confidenceLevel: 'medium',
        },
      ],
    });

    setName('');
    setCode('');
    setDescription('');
    setShowAddSubjectModal(false);
  };

  const handleAddChapterSubmit = (subjectId: string) => {
    if (!newChapterTitle.trim()) return;
    addChapter(subjectId, newChapterTitle.trim());
    setNewChapterTitle('');
    setActiveSubjectForNewChapter(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>المواد والمناهج الدراسية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            نظّم فصول كل مادة، تتبّع نسبة إنجاز الدروس، واربطها بالملخصات والبطاقات التكرارية.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      </div>

      {/* Subjects Grid / List */}
      <div className="space-y-4">
        {subjects.map((sub) => {
          const isExpanded = expandedSubjectId === sub.id;
          const completedChapters = sub.chapters.filter((c) => c.isCompleted).length;
          const totalChapters = sub.chapters.length;
          const progressPercent =
            totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

          return (
            <div
              key={sub.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
            >
              {/* Subject Summary Header */}
              <div
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {sub.name}
                      </h3>
                      {sub.code && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {sub.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {sub.description || 'لا يوجد وصف مدخل'}
                    </p>
                  </div>
                </div>

                {/* Right info & progress */}
                <div className="flex items-center gap-6 justify-between md:justify-end">
                  <div className="w-36 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {completedChapters} من {totalChapters} فصول
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubject(sub.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="حذف المادة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Expanded Detail: Chapters & Units */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      قائمة الفصول والدروس المقررة:
                    </span>
                    <button
                      onClick={() => setActiveSubjectForNewChapter(sub.id)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة فصل / درس جديد
                    </button>
                  </div>

                  {/* Add chapter inline input */}
                  {activeSubjectForNewChapter === sub.id && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-500/30">
                      <input
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        placeholder="عنوان الفصل أو الدرس الجديد..."
                        className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none px-2"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddChapterSubmit(sub.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddChapterSubmit(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        إضافة
                      </button>
                      <button
                        onClick={() => setActiveSubjectForNewChapter(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Chapters List */}
                  <div className="space-y-2">
                    {sub.chapters.map((ch, idx) => (
                      <div
                        key={ch.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleChapterComplete(sub.id, ch.id)}
                            className="cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
                            title={ch.isCompleted ? 'تحديد كغير مكتمل' : 'تحديد كمكتمل'}
                          >
                            {ch.isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                ch.isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {idx + 1}. {ch.title}
                            </span>
                            {ch.unit && (
                              <span className="text-[10px] text-slate-400 block">{ch.unit}</span>
                            )}
                          </div>
                        </div>

                        {/* Associated quick tools */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentTab('summaries')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="تلخيص هذا الفصل بالذكاء الاصطناعي"
                          >
                            تلخيص
                          </button>
                          <button
                            onClick={() => setCurrentTab('flashcards')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
                            title="بطاقات استذكار هذا الفصل"
                          >
                            بطاقات
                          </button>
                          <button
                            onClick={() => setCurrentTab('quizzes')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                            title="اختبار على هذا الفصل"
                          >
                            اختبار
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              إضافة مادة دراسية جديدة
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المادة *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الأحياء، اللغة الإيطالية، التاريخ الإسلامي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رمز المادة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BIO-201"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الساعات الأسبوعية المستهدفة
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={targetHoursWeekly}
                    onChange={(e) => setTargetHoursWeekly(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لون تمييز المادة
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نبذة أو أهداف تعليمية
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر لمحتوى المنهج وأهدافك الشخصية..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
