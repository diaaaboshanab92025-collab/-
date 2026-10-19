export type EducationalSystem = 'egyptian_general' | 'al_azhar' | 'saudi' | 'general_arab';

export type EducationalStage = 'primary' | 'preparatory' | 'secondary' | 'university';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  system: EducationalSystem;
  stage: EducationalStage;
  grade: string;
  dailyGoalMinutes: number;
  weeklyGoalHours: number;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  unit?: string;
  order: number;
  isCompleted: boolean;
  notes?: string;
  confidenceLevel?: 'low' | 'medium' | 'high';
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  description?: string;
  chapters: Chapter[];
  targetHoursWeekly?: number;
  isArchived?: boolean;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId: string;
  chapterId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes: number;
  actualMinutes?: number;
  priority: TaskPriority;
  status: TaskStatus;
  subtasks: Subtask[];
  completedAt?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  chapterId?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  type: 'pomodoro' | 'continuous' | 'manual';
  notes?: string;
  focusRating?: number; // 1 to 5
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  // Spaced repetition fields (SM-2)
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  consecutiveSuccesses: number;
  totalFailures: number;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId: string;
  chapterId?: string;
  cardCount: number;
  createdAt: string;
}

export interface SummaryRecord {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  chapterId?: string;
  originalText?: string;
  summaryText: string;
  type: 'short' | 'detailed' | 'structured' | 'key_concepts' | 'exam_questions';
  difficulty?: string;
  tags?: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  chapterId?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  userAnswers: Record<string, string>; // questionId -> answer
  percentage: number;
  date: string; // ISO
  weakTopics?: string[];
}

export interface VideoStoryboardScene {
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  visuals: string;
  narration: string;
  keyTakeaway?: string;
}

export interface VideoLesson {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  chapterId?: string;
  videoUrl?: string; // YouTube or external
  embedUrl?: string;
  notes?: string;
  understoodStatus?: 'understood' | 'partial' | 'needs_review' | 'unwatched';
  storyboard?: {
    summary: string;
    totalDurationMinutes: number;
    scenes: VideoStoryboardScene[];
  };
  createdAt: string;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  subjectId: string;
  chapterId?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExamEvent {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:mm
  includedChapters: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  revisionPlan?: string;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
}
