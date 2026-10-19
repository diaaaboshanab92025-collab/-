import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import {
  BookOpen,
  Play,
  Pause,
  Clock,
  Sun,
  Moon,
  Menu,
  Sparkles,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { CloudStatusBadge } from './CloudStatusBadge';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setCurrentTab,
  onOpenMobileMenu,
  onOpenAuthModal,
}) => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { timer, pauseTimer, resumeTimer } = useStudy();

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Right side: Mobile Menu + Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 text-right cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                ذاكرلي
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                Zakerly
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              ذاكر بذكاء، تابع تقدمك، وحقق هدفك
            </p>
          </div>
        </button>
      </div>

      {/* Center: Live Timer if active */}
      {timer.isActive && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 animate-pulse">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <button
            onClick={() => setCurrentTab('timer')}
            className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            جلسة مذاكرة: {formatTimerTime(timer.secondsElapsed)}
          </button>
          <button
            onClick={timer.isPaused ? resumeTimer : pauseTimer}
            className="p-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            title={timer.isPaused ? 'استئناف' : 'إيقاف مؤقت'}
          >
            {timer.isPaused ? <Play className="w-3 h-3 fill-white" /> : <Pause className="w-3 h-3 fill-white" />}
          </button>
        </div>
      )}

      {/* Left side: Quick actions & user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cloud status badge */}
        <CloudStatusBadge />

        {/* AI Tutor fast launcher */}
        <button
          onClick={() => setCurrentTab('tutor')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>المعلم الذكي</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          aria-label="تغيير المظهر"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile / Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('settings')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[100px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[100px]">
                  {user.grade}
                </span>
              </div>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>
        )}
      </div>
    </header>
  );
};
