import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  CheckSquare,
  FileText,
  Bot,
  Video,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Calendar,
  BarChart3,
  Settings,
  Flame,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { metrics, tasks, cards } = useStudy();

  const dueCardsCount = cards.filter((c) => {
    const today = new Date().toISOString().split('T')[0];
    return c.nextReviewDate <= today;
  }).length;

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'subjects', label: 'موادي الدراسية', icon: BookOpen },
    { id: 'timer', label: 'مؤقت المذاكرة', icon: Timer },
    { id: 'tasks', label: 'المهام والمخطط', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'summaries', label: 'الملخصات الذكية', icon: FileText, isAi: true },
    { id: 'tutor', label: 'المعلم الذكي', icon: Bot, isAi: true },
    { id: 'videos', label: 'فيديوهات الشرح', icon: Video, isAi: true },
    { id: 'flashcards', label: 'البطاقات والتكرار', icon: Layers, badge: dueCardsCount > 0 ? dueCardsCount : undefined },
    { id: 'quizzes', label: 'بنك الاختبارات', icon: HelpCircle, isAi: true },
    { id: 'notes', label: 'مكتبة الملاحظات', icon: FileSpreadsheet },
    { id: 'calendar', label: 'التقويم والامتحانات', icon: Calendar },
    { id: 'reports', label: 'تقارير الإنجاز', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات والملف', icon: Settings },
  ];

  const handleSelectTab = (id: string) => {
    setCurrentTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              ذ
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">ذاكرلي</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak & Today Study Pill */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                {metrics.streakDays} أيام متتالية
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300">
                استمر في الإنجاز!
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
              {metrics.todayStudyMinutes} د
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              من {metrics.todayGoalMinutes} د
            </span>
          </div>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.isAi && !isActive && (
                    <span className="p-0.5 rounded text-indigo-500 dark:text-indigo-400" title="مدعوم بالذكاء الاصطناعي">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Mini Card */}
        {user && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 m-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.grade}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
