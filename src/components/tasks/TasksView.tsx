import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { StudyTask, TaskPriority, TaskStatus } from '../../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  Filter,
  Search,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
} from 'lucide-react';

interface TasksViewProps {
  setCurrentTab: (tab: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ setCurrentTab }) => {
  const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskStatus, toggleSubtask, addToast } =
    useStudy();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'planner'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [subtasksInput, setSubtasksInput] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedSubtasks = subtasksInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((t, idx) => ({ id: 'st_' + Date.now() + '_' + idx, title: t, isCompleted: false }));

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      subjectId,
      dueDate,
      dueTime: dueTime || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      priority,
      status: 'todo',
      subtasks: parsedSubtasks,
    });

    setTitle('');
    setDescription('');
    setSubtasksInput('');
    setShowAddModal(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === 'all' || t.subjectId === selectedSubjectId;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    if (!matchesSearch || !matchesSubject || !matchesPriority) return false;

    if (activeTab === 'today') {
      return t.dueDate === todayStr && t.status !== 'completed';
    } else if (activeTab === 'upcoming') {
      return t.dueDate > todayStr && t.status !== 'completed';
    } else if (activeTab === 'overdue') {
      return t.dueDate < todayStr && t.status !== 'completed';
    } else if (activeTab === 'completed') {
      return t.status === 'completed';
    }
    return true;
  });

  // Weekly Planner days calculation
  const weekDays: { dateStr: string; dayName: string; tasks: StudyTask[]; totalMinutes: number }[] = [];
  const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
    weekDays.push({
      dateStr,
      dayName: daysArabic[d.getDay()],
      tasks: dayTasks,
      totalMinutes,
    });
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-purple-600" />
            <span>المهام والمخطط الدراسي الأسبوعي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            خطط لمهامك الدراسية، وزّع أعباء المذاكرة بذكاء، وتجنب التراكم والضغط قبل الامتحانات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>مهمة جديدة</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'today'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          اليوم ({tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          القادمة ({tasks.filter((t) => t.dueDate > todayStr && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overdue'
              ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs'
              : 'text-slate-500 hover:text-rose-600'
          }`}
        >
          المتأخرة ({tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-emerald-600'
          }`}
        >
          المكتملة ({tasks.filter((t) => t.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'planner'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-600 hover:text-purple-700 font-extrabold'
          }`}
        >
          المخطط الأسبوعي 📅
        </button>
      </div>

      {activeTab === 'planner' ? (
        /* Weekly Planner View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              نظام التنبيه الذكي: يتم تنبيهك فوراً إذا تجاوزت ساعات المهام المقررة لأي يوم سقف 4 ساعات
              لمنع الإرهاق.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const isOverloaded = day.totalMinutes > 240; // > 4 hours
              return (
                <div
                  key={day.dateStr}
                  className={`p-3.5 rounded-3xl border flex flex-col justify-between min-h-[220px] ${
                    isOverloaded
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-black block text-slate-900 dark:text-white">
                          {day.dayName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{day.dateStr}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOverloaded
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {day.totalMinutes} د
                      </span>
                    </div>

                    {isOverloaded && (
                      <span className="text-[9px] font-bold text-rose-600 block">
                        ⚠️ عبء دراسي مرتفع!
                      </span>
                    )}

                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {day.tasks.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic block py-4 text-center">
                          يوم متاح
                        </span>
                      ) : (
                        day.tasks.map((t) => {
                          const sub = subjects.find((s) => s.id === t.subjectId);
                          return (
                            <div
                              key={t.id}
                              onClick={() => toggleTaskStatus(t.id)}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-[10px] space-y-0.5 cursor-pointer hover:border-slate-300"
                            >
                              <span
                                className={`font-bold block line-clamp-1 ${
                                  t.status === 'completed'
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {t.title}
                              </span>
                              <span className="text-slate-400">{sub?.name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDueDate(day.dateStr);
                      setShowAddModal(true);
                    }}
                    className="mt-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-center gap-1 cursor-pointer pt-1"
                  >
                    <Plus className="w-3 h-3" /> مهمة
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Regular Tasks List View */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المهام..."
                className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                <option value="all">جميع المواد</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                <option value="all">كافة الأولويات</option>
                <option value="high">أولوية قصوى</option>
                <option value="medium">أولوية متوسطة</option>
                <option value="low">أولوية منخفضة</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                لا توجد مهام تطابق هذا التصنيف حالياً.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                const isDone = task.status === 'completed';
                const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                const completedSubtasks = task.subtasks.filter((st) => st.isCompleted).length;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-3xl border transition-all ${
                      isDone
                        ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {isDone ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <h4
                            className={`text-sm font-bold ${
                              isDone
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: sub?.color || '#8b5cf6' }}
                            />
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {sub?.name || 'مادة عامة'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" /> {task.dueDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.estimatedMinutes} دقيقة
                            </span>
                          </div>

                          {/* Subtasks Checkboxes if any */}
                          {hasSubtasks && (
                            <div className="pt-2 pl-2 space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 block">
                                المهام الفرعية ({completedSubtasks} من {task.subtasks.length}):
                              </span>
                              {task.subtasks.map((st) => (
                                <label
                                  key={st.id}
                                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={st.isCompleted}
                                    onChange={() => toggleSubtask(task.id, st.id)}
                                    className="rounded border-slate-300 text-purple-600 focus:ring-0"
                                  />
                                  <span className={st.isCompleted ? 'line-through opacity-60' : ''}>
                                    {st.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {task.priority === 'high' ? 'أولوية قصوى' : 'عادية'}
                        </span>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              إضافة مهمة دراسية جديدة
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حل 20 سؤال كيرشوف في كتاب الامتحان..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الأولوية
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">قصوى / عاجلة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المدة التقديرية (دقيقة)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مهام فرعية (اكتب كل خطوة في سطر منفصل)
                </label>
                <textarea
                  rows={2}
                  value={subtasksInput}
                  onChange={(e) => setSubtasksInput(e.target.value)}
                  placeholder="الخطوة 1&#10;الخطوة 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
