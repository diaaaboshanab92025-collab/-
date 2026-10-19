import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { aiService } from '../../services/ai';
import { Quiz, QuizQuestion } from '../../types';
import {
  HelpCircle,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';

interface QuizzesViewProps {
  setCurrentTab: (tab: string) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({ setCurrentTab }) => {
  const { quizzes, quizAttempts, subjects, addQuiz, deleteQuiz, recordQuizAttempt, addToast } =
    useStudy();

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // AI Gen state
  const [aiContent, setAiContent] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiType, setAiType] = useState<'mixed' | 'mcq' | 'true_false'>('mixed');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiSubjectId, setAiSubjectId] = useState(subjects[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    const weakTopics: string[] = [];

    activeQuiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      } else {
        weakTopics.push(q.question.slice(0, 40));
      }
    });

    const percentage = Math.round((score / activeQuiz.questions.length) * 100);

    recordQuizAttempt({
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      subjectId: activeQuiz.subjectId,
      score,
      totalQuestions: activeQuiz.questions.length,
      userAnswers,
      percentage,
      weakTopics: weakTopics.length > 0 ? weakTopics : undefined,
    });

    setIsSubmitted(true);
  };

  const handleGenerateAIQuiz = async () => {
    if (!aiContent.trim()) {
      addToast('يرجى تقديم محتوى الدرس أو الموضوع لتوليد الاختبار', 'error');
      return;
    }

    setIsGenerating(true);
    const sub = subjects.find((s) => s.id === aiSubjectId);

    const generated = await aiService.generateQuiz({
      content: aiContent,
      questionCount: aiQuestionCount,
      type: aiType,
      difficulty: aiDifficulty,
      subject: sub?.name || 'عام',
    });

    if (generated && Array.isArray(generated.questions)) {
      const created = addQuiz({
        title: generated.title || `اختبار: ${sub?.name || 'مراجعة'}`,
        subjectId: aiSubjectId,
        questions: generated.questions,
      });

      setShowGenerateModal(false);
      setAiContent('');
      handleStartQuiz(created.id);
      addToast('تم إنشاء الاختبار بنجاح! بالتوفيق في الحل 🎯', 'success');
    }
    setIsGenerating(false);
  };

  // Taking Quiz Mode
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQuestionIndex];
    let score = 0;
    if (isSubmitted) {
      activeQuiz.questions.forEach((question) => {
        if (userAnswers[question.id] === question.correctAnswer) score++;
      });
    }

    return (
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveQuizId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowRight className="w-4 h-4" /> خروج إلى قائمة الاختبارات
          </button>

          <span className="text-xs font-bold text-slate-500">
            السؤال {currentQuestionIndex + 1} من {activeQuiz.questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Score Card if Submitted */}
        {isSubmitted && (
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg text-center space-y-2">
            <Award className="w-10 h-10 mx-auto text-amber-100" />
            <h3 className="text-xl font-black">
              نتيجتك: {score} من {activeQuiz.questions.length} (
              {Math.round((score / activeQuiz.questions.length) * 100)}%)
            </h3>
            <p className="text-xs text-amber-100">
              {score === activeQuiz.questions.length
                ? 'علامة كاملة وممتازة! أنت مستعد تماماً للامتحان 🌟'
                : 'أداء جيد! راجع الإجابات والتفسيرات النموذجية بالأسفل لتقوية النقاط الصعبة.'}
            </p>
          </div>
        )}

        {/* Question Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {q.type === 'mcq'
                ? 'اختيار من متعدد'
                : q.type === 'true_false'
                ? 'صح أو خطأ'
                : 'سؤال مقالي قصير'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
              {q.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((option, idx) => {
              const isSelected = userAnswers[q.id] === option;
              const isCorrect = q.correctAnswer === option;

              let style =
                'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200';

              if (isSubmitted) {
                if (isCorrect) {
                  style =
                    'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  style =
                    'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 line-through';
                }
              } else if (isSelected) {
                style =
                  'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(q.id, option)}
                  disabled={isSubmitted}
                  className={`w-full text-right p-4 rounded-2xl border transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-between ${style}`}
                >
                  <span>{option}</span>
                  {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if Submitted */}
          {isSubmitted && q.explanation && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                💡 التفسير النموذجي:
              </span>
              <p className="leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation / Submit buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" /> السابق
          </button>

          {currentQuestionIndex + 1 < activeQuiz.questions.length ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              التالي <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : !isSubmitted ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
            >
              تسليم الإجابات وإنهاء الاختبار
            </button>
          ) : (
            <button
              onClick={() => handleStartQuiz(activeQuiz.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> إعادة الاختبار
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quizzes Overview
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <span>بنك الاختبارات والتقييم الذكي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ولّد اختبارات تفاعلية استناداً لمذكراتك، واكتشف نقاط الضعف قبل خوض الامتحانات الرسمية.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer w-fit"
        >
          <Sparkles className="w-4 h-4" />
          <span>توليد اختبار بالذكاء الاصطناعي</span>
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => {
          const sub = subjects.find((s) => s.id === quiz.subjectId);
          return (
            <div
              key={quiz.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: sub?.color || '#f59e0b' }}
                  >
                    {sub?.name || 'مادة عامة'}
                  </span>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-black text-slate-900 dark:text-white text-sm line-clamp-2">
                  {quiz.title}
                </h3>
                <span className="text-xs text-slate-500 block">
                  {quiz.questions.length} أسئلة متنوعة مع التفسير
                </span>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>بدء الاختبار الآن</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Attempts History */}
      {quizAttempts.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            سجل محاولات الاختبارات السابقة
          </h3>
          <div className="space-y-2">
            {quizAttempts.slice(0, 5).map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-slate-900 dark:text-white">{att.quizTitle}</span>
                <span className="font-mono font-bold text-emerald-600">
                  {att.score} / {att.totalQuestions} ({att.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Generate AI Quiz */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                توليد اختبار تدريبي بالذكاء الاصطناعي
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المحتوى أو الملخص المرجعي للاختبار *
                </label>
                <textarea
                  rows={5}
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder="الصق نص الدرس أو النقاط التي ترغب في صياغة أسئلة امتحانات عليها..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">المادة</label>
                  <select
                    value={aiSubjectId}
                    onChange={(e) => setAiSubjectId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">العدد</label>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value={3}>3 أسئلة</option>
                    <option value={5}>5 أسئلة</option>
                    <option value={10}>10 أسئلة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">النوع</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value="mixed">منوع</option>
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صح أو خطأ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAIQuiz}
                  disabled={isGenerating || !aiContent.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد الاختبار</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
