import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/layout/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';

import { DashboardView } from './components/dashboard/DashboardView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { TimerView } from './components/timer/TimerView';
import { TasksView } from './components/tasks/TasksView';
import { SummariesView } from './components/summaries/SummariesView';
import { TutorView } from './components/tutor/TutorView';
import { VideosView } from './components/videos/VideosView';
import { FlashcardsView } from './components/flashcards/FlashcardsView';
import { QuizzesView } from './components/quizzes/QuizzesView';
import { NotesView } from './components/notes/NotesView';
import { CalendarView } from './components/calendar/CalendarView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showLandingView, setShowLandingView] = useState<boolean>(!user);

  // If user explicitly views landing page or is logged out and chooses to see it
  if (showLandingView && !isAuthenticated) {
    return (
      <>
        <LandingPage
          onEnterApp={() => {
            setShowLandingView(false);
          }}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setShowAuthModal(true);
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (user) setShowLandingView(false);
          }}
          initialMode={authModalMode}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setShowLandingView(false);
          setCurrentTab(tab);
        }}
        onOpenMobileMenu={() => setIsSidebarOpenMobile(true)}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setShowAuthModal(true);
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Content View Router */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          {currentTab === 'dashboard' && <DashboardView setCurrentTab={setCurrentTab} />}
          {currentTab === 'subjects' && <SubjectsView setCurrentTab={setCurrentTab} />}
          {currentTab === 'timer' && <TimerView setCurrentTab={setCurrentTab} />}
          {currentTab === 'tasks' && <TasksView setCurrentTab={setCurrentTab} />}
          {currentTab === 'summaries' && <SummariesView setCurrentTab={setCurrentTab} />}
          {currentTab === 'tutor' && <TutorView setCurrentTab={setCurrentTab} />}
          {currentTab === 'videos' && <VideosView setCurrentTab={setCurrentTab} />}
          {currentTab === 'flashcards' && <FlashcardsView setCurrentTab={setCurrentTab} />}
          {currentTab === 'quizzes' && <QuizzesView setCurrentTab={setCurrentTab} />}
          {currentTab === 'notes' && <NotesView setCurrentTab={setCurrentTab} />}
          {currentTab === 'calendar' && <CalendarView setCurrentTab={setCurrentTab} />}
          {currentTab === 'reports' && <ReportsView setCurrentTab={setCurrentTab} />}
          {currentTab === 'settings' && <SettingsView setCurrentTab={setCurrentTab} />}
        </main>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSidebar={() => setIsSidebarOpenMobile(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <MainAppContent />
      </StudyProvider>
    </AuthProvider>
  );
}
