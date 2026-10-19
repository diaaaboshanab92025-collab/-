import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Subject,
  Chapter,
  StudyTask,
  StudySession,
  FlashcardDeck,
  Flashcard,
  SummaryRecord,
  Quiz,
  QuizAttempt,
  VideoLesson,
  StudyNote,
  ExamEvent,
} from '../types';
import { storage } from '../services/storage';
import { calculateDashboardMetrics, DashboardMetrics } from '../services/analytics';
import { calculateNextReview, Rating } from '../services/spacedRepetition';
import { useAuth } from './AuthContext';

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  secondsElapsed: number;
  mode: 'pomodoro_25' | 'pomodoro_50' | 'stopwatch';
  targetSeconds: number;
  subjectId: string;
  chapterId?: string;
  notes?: string;
  sessionStartTime: string;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface StudyContextType {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  decks: FlashcardDeck[];
  cards: Flashcard[];
  summaries: SummaryRecord[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  videos: VideoLesson[];
  notes: StudyNote[];
  exams: ExamEvent[];
  metrics: DashboardMetrics;
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Timer
  timer: ActiveTimerState;
  startTimer: (subjectId: string, chapterId?: string, mode?: ActiveTimerState['mode']) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishTimer: (notes?: string, focusRating?: number) => void;
  resetTimer: () => void;

  // Subjects
  addSubject: (sub: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addChapter: (subjectId: string, title: string) => void;
  toggleChapterComplete: (subjectId: string, chapterId: string) => void;

  // Tasks
  addTask: (task: Omit<StudyTask, 'id' | 'createdAt' | 'userId'>) => StudyTask;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Study Sessions
  addManualSession: (session: Omit<StudySession, 'id' | 'createdAt' | 'userId'>) => void;
  deleteSession: (id: string) => void;

  // Flashcards
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'userId' | 'cardCount'>) => FlashcardDeck;
  deleteDeck: (deckId: string) => void;
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'repetitions' | 'intervalDays' | 'easeFactor' | 'nextReviewDate' | 'consecutiveSuccesses' | 'totalFailures'>) => Flashcard;
  deleteCard: (cardId: string) => void;
  reviewCard: (cardId: string, rating: Rating) => void;

  // Summaries
  addSummary: (summary: Omit<SummaryRecord, 'id' | 'createdAt' | 'userId'>) => SummaryRecord;
  deleteSummary: (id: string) => void;

  // Quizzes
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'userId'>) => Quiz;
  deleteQuiz: (id: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'userId' | 'date'>) => void;

  // Videos
  addVideo: (video: Omit<VideoLesson, 'id' | 'createdAt' | 'userId'>) => VideoLesson;
  updateVideo: (id: string, updates: Partial<VideoLesson>) => void;
  deleteVideo: (id: string) => void;

  // Notes
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => StudyNote;
  updateNote: (id: string, updates: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;

  // Exams
  addExam: (exam: Omit<ExamEvent, 'id' | 'createdAt' | 'userId'>) => ExamEvent;
  updateExam: (id: string, updates: Partial<ExamEvent>) => void;
  deleteExam: (id: string) => void;

  // Reset & Refresh
  refreshAll: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const TIMER_STORAGE_KEY = 'zakerly_active_timer';

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects());
  const [tasks, setTasks] = useState<StudyTask[]>(() => storage.getTasks());
  const [sessions, setSessions] = useState<StudySession[]>(() => storage.getSessions());
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => storage.getDecks());
  const [cards, setCards] = useState<Flashcard[]>(() => storage.getCards());
  const [summaries, setSummaries] = useState<SummaryRecord[]>(() => storage.getSummaries());
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storage.getQuizzes());
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => storage.getQuizAttempts());
  const [videos, setVideos] = useState<VideoLesson[]>(() => storage.getVideos());
  const [notes, setNotes] = useState<StudyNote[]>(() => storage.getNotes());
  const [exams, setExams] = useState<ExamEvent[]>(() => storage.getExams());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Timer state with crash/refresh recovery
  const [timer, setTimer] = useState<ActiveTimerState>(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isActive && !parsed.isPaused && parsed.lastTick) {
          // Add missed seconds while away
          const elapsedSince = Math.floor((Date.now() - parsed.lastTick) / 1000);
          if (elapsedSince > 0 && elapsedSince < 3600 * 6) {
            parsed.secondsElapsed += elapsedSince;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to recover timer:', e);
    }
    return {
      isActive: false,
      isPaused: false,
      secondsElapsed: 0,
      mode: 'pomodoro_25',
      targetSeconds: 25 * 60,
      subjectId: '',
      sessionStartTime: new Date().toISOString(),
    };
  });

  const addToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshAll = useCallback(() => {
    setSubjects(storage.getSubjects());
    setTasks(storage.getTasks());
    setSessions(storage.getSessions());
    setDecks(storage.getDecks());
    setCards(storage.getCards());
    setSummaries(storage.getSummaries());
    setQuizzes(storage.getQuizzes());
    setQuizAttempts(storage.getQuizAttempts());
    setVideos(storage.getVideos());
    setNotes(storage.getNotes());
    setExams(storage.getExams());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => refreshAll();
    window.addEventListener('zakerly_storage_change', handleStorageChange);
    return () => window.removeEventListener('zakerly_storage_change', handleStorageChange);
  }, [refreshAll]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timer.isActive && !timer.isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const nextSeconds = prev.secondsElapsed + 1;
          const updated = {
            ...prev,
            secondsElapsed: nextSeconds,
            lastTick: Date.now(),
          };
          localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isActive, timer.isPaused]);

  // Timer methods
  const startTimer = (subjectId: string, chapterId?: string, mode: ActiveTimerState['mode'] = 'pomodoro_25') => {
    let target = 25 * 60;
    if (mode === 'pomodoro_50') target = 50 * 60;
    if (mode === 'stopwatch') target = 0;

    const newState: ActiveTimerState = {
      isActive: true,
      isPaused: false,
      secondsElapsed: 0,
      mode,
      targetSeconds: target,
      subjectId,
      chapterId,
      sessionStartTime: new Date().toISOString(),
    };
    setTimer(newState);
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ ...newState, lastTick: Date.now() }));
    addToast('بدأت جلسة المذاكرة! ركز وحقق هدفك 🎯', 'info');
  };

  const pauseTimer = () => {
    setTimer((prev) => {
      const updated = { ...prev, isPaused: true };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resumeTimer = () => {
    setTimer((prev) => {
      const updated = { ...prev, isPaused: false, lastTick: Date.now() };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetTimer = () => {
    const initial: ActiveTimerState = {
      isActive: false,
      isPaused: false,
      secondsElapsed: 0,
      mode: 'pomodoro_25',
      targetSeconds: 25 * 60,
      subjectId: '',
      sessionStartTime: new Date().toISOString(),
    };
    setTimer(initial);
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  const finishTimer = (notes?: string, focusRating: number = 5) => {
    // Calculate actual active minutes
    const actualMinutes = Math.max(1, Math.round(timer.secondsElapsed / 60));
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const newSession: StudySession = {
      id: 'ses_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      subjectId: timer.subjectId || subjects[0]?.id || 'sub_general',
      chapterId: timer.chapterId,
      durationMinutes: actualMinutes,
      date: todayStr,
      startTime: timer.sessionStartTime,
      endTime: now.toISOString(),
      type: timer.mode === 'stopwatch' ? 'continuous' : 'pomodoro',
      notes: notes || 'جلسة تركيز من المؤقت الذكي',
      focusRating,
      createdAt: now.toISOString(),
    };

    const updatedSessions = [newSession, ...sessions];
    storage.setSessions(updatedSessions);
    setSessions(updatedSessions);
    resetTimer();

    addToast(`رائع! تم تسجيل ${actualMinutes} دقيقة مذاكرة فعلية بنجاح 👏`, 'success');
  };

  // Subjects
  const addSubject = (sub: Omit<Subject, 'id' | 'createdAt' | 'userId'>): Subject => {
    const newSub: Subject = {
      ...sub,
      id: 'sub_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [...subjects, newSub];
    storage.setSubjects(updated);
    setSubjects(updated);
    addToast('تمت إضافة المادة بنجاح', 'success');
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    storage.setSubjects(updated);
    setSubjects(updated);
    addToast('تم تحديث بيانات المادة', 'info');
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    storage.setSubjects(updated);
    setSubjects(updated);
    addToast('تم حذف المادة', 'info');
  };

  const addChapter = (subjectId: string, title: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    const newChapter: Chapter = {
      id: 'ch_' + Date.now(),
      title,
      order: sub.chapters.length + 1,
      isCompleted: false,
      confidenceLevel: 'medium',
    };
    const updated = subjects.map((s) =>
      s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s
    );
    storage.setSubjects(updated);
    setSubjects(updated);
    addToast('تمت إضافة الفصل الدراسي', 'success');
  };

  const toggleChapterComplete = (subjectId: string, chapterId: string) => {
    const updated = subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map((ch) =>
          ch.id === chapterId ? { ...ch, isCompleted: !ch.isCompleted } : ch
        ),
      };
    });
    storage.setSubjects(updated);
    setSubjects(updated);
  };

  // Tasks
  const addTask = (task: Omit<StudyTask, 'id' | 'createdAt' | 'userId'>): StudyTask => {
    const newTask: StudyTask = {
      ...task,
      id: 'tsk_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    storage.setTasks(updated);
    setTasks(updated);
    addToast('تمت إضافة المهمة بنجاح', 'success');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    storage.setTasks(updated);
    setTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    storage.setTasks(updated);
    setTasks(updated);
    addToast('تم حذف المهمة', 'info');
  };

  const toggleTaskStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      const isDone = t.status === 'completed';
      return {
        ...t,
        status: isDone ? ('todo' as const) : ('completed' as const),
        completedAt: isDone ? undefined : new Date().toISOString(),
      };
    });
    storage.setTasks(updated);
    setTasks(updated);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        ),
      };
    });
    storage.setTasks(updated);
    setTasks(updated);
  };

  // Sessions
  const addManualSession = (session: Omit<StudySession, 'id' | 'createdAt' | 'userId'>) => {
    const newSession: StudySession = {
      ...session,
      id: 'ses_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [newSession, ...sessions];
    storage.setSessions(updated);
    setSessions(updated);
    addToast('تمت إضافة جلسة المذاكرة اليدوية بنجاح', 'success');
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    storage.setSessions(updated);
    setSessions(updated);
    addToast('تم حذف الجلسة', 'info');
  };

  // Flashcards
  const addDeck = (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'userId' | 'cardCount'>): FlashcardDeck => {
    const newDeck: FlashcardDeck = {
      ...deck,
      id: 'deck_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      cardCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDeck, ...decks];
    storage.setDecks(updated);
    setDecks(updated);
    addToast('تم إنشاء حزمة البطاقات', 'success');
    return newDeck;
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter((d) => d.id !== deckId);
    const updatedCards = cards.filter((c) => c.deckId !== deckId);
    storage.setDecks(updatedDecks);
    storage.setCards(updatedCards);
    setDecks(updatedDecks);
    setCards(updatedCards);
    addToast('تم حذف حزمة البطاقات', 'info');
  };

  const addCard = (card: Omit<Flashcard, 'id' | 'createdAt' | 'repetitions' | 'intervalDays' | 'easeFactor' | 'nextReviewDate' | 'consecutiveSuccesses' | 'totalFailures'>): Flashcard => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      ...card,
      id: 'c_' + Date.now() + Math.random().toString(36).substring(2, 5),
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: todayStr,
      consecutiveSuccesses: 0,
      totalFailures: 0,
      createdAt: new Date().toISOString(),
    };
    const updatedCards = [...cards, newCard];
    storage.setCards(updatedCards);
    setCards(updatedCards);

    // update deck count
    const updatedDecks = decks.map((d) =>
      d.id === card.deckId ? { ...d, cardCount: d.cardCount + 1 } : d
    );
    storage.setDecks(updatedDecks);
    setDecks(updatedDecks);

    return newCard;
  };

  const deleteCard = (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    const updatedCards = cards.filter((c) => c.id !== cardId);
    storage.setCards(updatedCards);
    setCards(updatedCards);

    if (cardToDelete) {
      const updatedDecks = decks.map((d) =>
        d.id === cardToDelete.deckId ? { ...d, cardCount: Math.max(0, d.cardCount - 1) } : d
      );
      storage.setDecks(updatedDecks);
      setDecks(updatedDecks);
    }
  };

  const reviewCard = (cardId: string, rating: Rating) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const scheduled = calculateNextReview(card, rating);
    const updatedCard: Flashcard = {
      ...card,
      ...scheduled,
      lastReviewedAt: new Date().toISOString(),
    };

    const updatedCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
    storage.setCards(updatedCards);
    setCards(updatedCards);
  };

  // Summaries
  const addSummary = (summary: Omit<SummaryRecord, 'id' | 'createdAt' | 'userId'>): SummaryRecord => {
    const newSummary: SummaryRecord = {
      ...summary,
      id: 'sum_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [newSummary, ...summaries];
    storage.setSummaries(updated);
    setSummaries(updated);
    addToast('تم حفظ التلخيص بنجاح', 'success');
    return newSummary;
  };

  const deleteSummary = (id: string) => {
    const updated = summaries.filter((s) => s.id !== id);
    storage.setSummaries(updated);
    setSummaries(updated);
    addToast('تم حذف التلخيص', 'info');
  };

  // Quizzes
  const addQuiz = (quiz: Omit<Quiz, 'id' | 'createdAt' | 'userId'>): Quiz => {
    const newQuiz: Quiz = {
      ...quiz,
      id: 'quiz_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [newQuiz, ...quizzes];
    storage.setQuizzes(updated);
    setQuizzes(updated);
    addToast('تم حفظ الاختبار بنجاح', 'success');
    return newQuiz;
  };

  const deleteQuiz = (id: string) => {
    const updated = quizzes.filter((q) => q.id !== id);
    storage.setQuizzes(updated);
    setQuizzes(updated);
    addToast('تم حذف الاختبار', 'info');
  };

  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'userId' | 'date'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: 'qa_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      date: new Date().toISOString(),
    };
    const updated = [newAttempt, ...quizAttempts];
    storage.setQuizAttempts(updated);
    setQuizAttempts(updated);
    addToast(`تم إنهاء الاختبار بنسبة ${attempt.percentage}%!`, 'success');
  };

  // Videos
  const addVideo = (video: Omit<VideoLesson, 'id' | 'createdAt' | 'userId'>): VideoLesson => {
    const newVideo: VideoLesson = {
      ...video,
      id: 'vid_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [newVideo, ...videos];
    storage.setVideos(updated);
    setVideos(updated);
    addToast('تمت إضافة درس الفيديو بنجاح', 'success');
    return newVideo;
  };

  const updateVideo = (id: string, updates: Partial<VideoLesson>) => {
    const updated = videos.map((v) => (v.id === id ? { ...v, ...updates } : v));
    storage.setVideos(updated);
    setVideos(updated);
  };

  const deleteVideo = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    storage.setVideos(updated);
    setVideos(updated);
    addToast('تم حذف درس الفيديو', 'info');
  };

  // Notes
  const addNote = (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): StudyNote => {
    const now = new Date().toISOString();
    const newNote: StudyNote = {
      ...note,
      id: 'not_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newNote, ...notes];
    storage.setNotes(updated);
    setNotes(updated);
    addToast('تم حفظ الملاحظة بنجاح', 'success');
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<StudyNote>) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    storage.setNotes(updated);
    setNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    storage.setNotes(updated);
    setNotes(updated);
    addToast('تم حذف الملاحظة', 'info');
  };

  // Exams
  const addExam = (exam: Omit<ExamEvent, 'id' | 'createdAt' | 'userId'>): ExamEvent => {
    const newExam: ExamEvent = {
      ...exam,
      id: 'ex_' + Date.now(),
      userId: user?.id || 'usr_student_1',
      createdAt: new Date().toISOString(),
    };
    const updated = [...exams, newExam];
    storage.setExams(updated);
    setExams(updated);
    addToast('تمت جدولة موعد الامتحان بنجاح', 'success');
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<ExamEvent>) => {
    const updated = exams.map((e) => (e.id === id ? { ...e, ...updates } : e));
    storage.setExams(updated);
    setExams(updated);
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    storage.setExams(updated);
    setExams(updated);
    addToast('تم حذف موعد الامتحان', 'info');
  };

  // Calculate live metrics
  const metrics = calculateDashboardMetrics(
    sessions,
    tasks,
    quizAttempts,
    cards,
    subjects,
    user?.dailyGoalMinutes || 120,
    user?.weeklyGoalHours || 14
  );

  return (
    <StudyContext.Provider
      value={{
        subjects,
        tasks,
        sessions,
        decks,
        cards,
        summaries,
        quizzes,
        quizAttempts,
        videos,
        notes,
        exams,
        metrics,
        toasts,
        addToast,
        removeToast,
        timer,
        startTimer,
        pauseTimer,
        resumeTimer,
        finishTimer,
        resetTimer,
        addSubject,
        updateSubject,
        deleteSubject,
        addChapter,
        toggleChapterComplete,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,
        addManualSession,
        deleteSession,
        addDeck,
        deleteDeck,
        addCard,
        deleteCard,
        reviewCard,
        addSummary,
        deleteSummary,
        addQuiz,
        deleteQuiz,
        recordQuizAttempt,
        addVideo,
        updateVideo,
        deleteVideo,
        addNote,
        updateNote,
        deleteNote,
        addExam,
        updateExam,
        deleteExam,
        refreshAll,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};
