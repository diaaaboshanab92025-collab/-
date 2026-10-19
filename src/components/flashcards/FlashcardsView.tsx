import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { aiService } from '../../services/ai';
import { FlashcardDeck, Flashcard } from '../../types';
import { Rating, isCardDue } from '../../services/spacedRepetition';
import {
  Layers,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Eye,
  ArrowRight,
  X,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface FlashcardsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ setCurrentTab }) => {
  const { decks, cards, subjects, addDeck, deleteDeck, addCard, deleteCard, reviewCard, addToast } =
    useStudy();

  const [activeDeckId, setActiveDeckId] = useState<string | null>(decks[0]?.id || null);
  const [studyModeDeckId, setStudyModeDeckId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Modals
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showAiGenModal, setShowAiGenModal] = useState(false);

  // Form states
  const [deckTitle, setDeckTitle] = useState('');
  const [deckSubjectId, setDeckSubjectId] = useState(subjects[0]?.id || '');
  const [deckDescription, setDeckDescription] = useState('');

  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardHint, setCardHint] = useState('');
  const [cardCategory, setCardCategory] = useState('مفهوم');

  // AI Gen state
  const [aiContent, setAiContent] = useState('');
  const [aiCardCount, setAiCardCount] = useState(6);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const selectedDeck = decks.find((d) => d.id === activeDeckId);
  const deckCards = cards.filter((c) => c.deckId === activeDeckId);
  const dueCardsInDeck = deckCards.filter(isCardDue);

  // Study session cards
  const studyDeck = decks.find((d) => d.id === studyModeDeckId);
  const studyCards = cards.filter((c) => c.deckId === studyModeDeckId && isCardDue(c));
  const currentCard = studyCards[currentCardIndex];

  const handleStartStudy = (deckId: string) => {
    const due = cards.filter((c) => c.deckId === deckId && isCardDue(c));
    if (due.length === 0) {
      addToast('لا توجد بطاقات مستحقة للمراجعة اليوم في هذه الحزمة! أحسنت 🌟', 'info');
      // allow reviewing all cards if desired
    }
    setStudyModeDeckId(deckId);
    setCurrentCardIndex(0);
    setIsAnswerRevealed(false);
    setShowHint(false);
  };

  const handleRateAnswer = (rating: Rating) => {
    if (!currentCard) return;

    reviewCard(currentCard.id, rating);

    if (currentCardIndex + 1 < studyCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsAnswerRevealed(false);
      setShowHint(false);
    } else {
      // Completed session
      addToast('أحسنت! أكملت مراجعة جميع البطاقات المستحقة لهذه الجلسة 🎉', 'success');
      setStudyModeDeckId(null);
    }
  };

  const handleCreateDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckTitle.trim()) return;

    const newD = addDeck({
      title: deckTitle.trim(),
      subjectId: deckSubjectId,
      description: deckDescription.trim() || undefined,
    });

    setActiveDeckId(newD.id);
    setDeckTitle('');
    setDeckDescription('');
    setShowCreateDeckModal(false);
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim() || !activeDeckId) return;

    addCard({
      deckId: activeDeckId,
      front: cardFront.trim(),
      back: cardBack.trim(),
      hint: cardHint.trim() || undefined,
      category: cardCategory || undefined,
    });

    setCardFront('');
    setCardBack('');
    setCardHint('');
    setShowCreateCardModal(false);
    addToast('تمت إضافة البطاقة بنجاح', 'success');
  };

  const handleGenerateCardsAI = async () => {
    if (!aiContent.trim() || !activeDeckId) {
      addToast('يرجى تقديم محتوى أو ملاحظات لتوليد البطاقات', 'error');
      return;
    }

    setIsGeneratingAi(true);
    const sub = subjects.find((s) => s.id === selectedDeck?.subjectId);

    const generated = await aiService.generateFlashcards({
      content: aiContent,
      cardCount: aiCardCount,
      subject: sub?.name || '',
    });

    if (generated && Array.isArray(generated.cards)) {
      generated.cards.forEach((c: any) => {
        addCard({
          deckId: activeDeckId,
          front: c.front,
          back: c.back,
          hint: c.hint,
          category: c.category,
        });
      });
      addToast(`تمت إضافة ${generated.cards.length} بطاقات استذكار بنجاح!`, 'success');
      setShowAiGenModal(false);
      setAiContent('');
    }
    setIsGeneratingAi(false);
  };

  // If in Distraction-Free Study Mode:
  if (studyModeDeckId && currentCard) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-300">
        {/* Top study header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStudyModeDeckId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowRight className="w-4 h-4" /> خروج من جلسة الاستذكار
          </button>

          <span className="text-xs font-bold text-slate-500">
            بطاقة {currentCardIndex + 1} من {studyCards.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / studyCards.length) * 100}%` }}
          />
        </div>

        {/* The Flashcard itself */}
        <div className="min-h-[340px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 shadow-lg flex flex-col justify-between text-center relative">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {currentCard.category || 'مفهوم'}
            </span>

            {/* Front Question */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed pt-2">
              {currentCard.front}
            </h2>

            {/* Hint toggle */}
            {currentCard.hint && (
              <div className="pt-2">
                {showHint ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                    💡 تلميح: {currentCard.hint}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-slate-400 hover:text-amber-500 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> إظهار تلميح
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Back Answer Area */}
          {isAnswerRevealed ? (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                الإجابة النموذجية
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentCard.back}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setIsAnswerRevealed(true)}
              className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>إظهار الإجابة (مسافة)</span>
            </button>
          )}
        </div>

        {/* Rating buttons (SM-2) */}
        {isAnswerRevealed && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              ما مدى سهولة استرجاعك للإجابة؟
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() => handleRateAnswer(0)}
                className="py-3 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all hover:scale-105"
              >
                نسيت تماماً (1)
                <span className="block text-[10px] opacity-75">مراجعة غداً</span>
              </button>
              <button
                onClick={() => handleRateAnswer(1)}
                className="py-3 px-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all hover:scale-105"
              >
                صعب (2)
                <span className="block text-[10px] opacity-75">خلال 3 أيام</span>
              </button>
              <button
                onClick={() => handleRateAnswer(2)}
                className="py-3 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all hover:scale-105"
              >
                جيد (3)
                <span className="block text-[10px] opacity-75">خلال 6 أيام</span>
              </button>
              <button
                onClick={() => handleRateAnswer(3)}
                className="py-3 px-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all hover:scale-105"
              >
                سهل جداً (4)
                <span className="block text-[10px] opacity-75">خلال 10+ أيام</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal Decks Overview Mode
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-purple-600" />
            <span>البطاقات التعليمية والتكرار المتباعد (Spaced Repetition)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            مستوحى من نظام Anki و Quizlet؛ لترسيخ المفاهيم والقوانين في ذاكرتك طويلة المدى بدون نسيان.
          </p>
        </div>

        <button
          onClick={() => setShowCreateDeckModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>حزمة بطاقات جديدة</span>
        </button>
      </div>

      {/* Decks Grid & Cards Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decks List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-500">حزم البطاقات المتاحة:</span>
          {decks.map((deck) => {
            const isSelected = activeDeckId === deck.id;
            const sub = subjects.find((s) => s.id === deck.subjectId);
            const deckCardList = cards.filter((c) => c.deckId === deck.id);
            const dueCount = deckCardList.filter(isCardDue).length;

            return (
              <div
                key={deck.id}
                onClick={() => setActiveDeckId(deck.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white mb-1 inline-block"
                      style={{ backgroundColor: sub?.color || '#8b5cf6' }}
                    >
                      {sub?.name || 'مادة عامة'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                      {deck.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeck(deck.id);
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{deckCardList.length} بطاقات</span>
                  {dueCount > 0 ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {dueCount} مستحقة اليوم!
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 text-[11px]">مكتملة اليوم ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Deck Cards & Study Trigger (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDeck ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedDeck.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedDeck.description || 'حزمة استذكار منظم بخوارزمية التكرار المتباعد.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiGenModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد بطاقات AI</span>
                  </button>

                  <button
                    onClick={() => setShowCreateCardModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>بطاقة يدوية</span>
                  </button>

                  <button
                    onClick={() => handleStartStudy(selectedDeck.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>ابدأ الاستذكار ({dueCardsInDeck.length})</span>
                  </button>
                </div>
              </div>

              {/* Cards List in this Deck */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  البطاقات في هذه الحزمة ({deckCards.length}):
                </span>

                {deckCards.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    لا توجد بطاقات في هذه الحزمة بعد. أضف بطاقة يدوية أو ولدها بالذكاء الاصطناعي!
                  </div>
                ) : (
                  deckCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            بطاقة {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {card.front}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{card.back}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">
                          المراجعة: {card.nextReviewDate}
                        </span>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">اختر حزمة لعرض بطاقاتها.</div>
          )}
        </div>
      </div>

      {/* Modal: Create Deck */}
      {showCreateDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateDeckModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              إنشاء حزمة بطاقات جديدة
            </h3>
            <form onSubmit={handleCreateDeckSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الحزمة *
                </label>
                <input
                  type="text"
                  required
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="مثال: قوانين الفيزياء الحديثة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة المرتبطة
                </label>
                <select
                  value={deckSubjectId}
                  onChange={(e) => setDeckSubjectId(e.target.value)}
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
                  وصف مختصر
                </label>
                <textarea
                  rows={2}
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  placeholder="وصف الهدف من الحزمة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDeckModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                >
                  إنشاء الحزمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Card Manually */}
      {showCreateCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateCardModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              إضافة بطاقة جديدة للحزمة
            </h3>
            <form onSubmit={handleCreateCardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوجه الأمامي (السؤال / المصطلح) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="ما هو قانون كيرشوف الأول؟"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوجه الخلفي (الإجابة النموذجية الدقيقة) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="المجموع الجبري للتيارات الداخلة = الخارجة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تلميح اختياري
                </label>
                <input
                  type="text"
                  value={cardHint}
                  onChange={(e) => setCardHint(e.target.value)}
                  placeholder="تلميح يساعد على التذكر..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCardModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                >
                  حفظ البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Flashcards Generator */}
      {showAiGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAiGenModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                توليد بطاقات استذكار ذكية بالذكاء الاصطناعي
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الصق محتوى الدرس أو الملخص *
                </label>
                <textarea
                  rows={5}
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder="الصق نص الدرس ليستخرج منه الذكاء الاصطناعي بطاقات سؤال وجواب فورية..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  عدد البطاقات المطلوبة:
                </span>
                <select
                  value={aiCardCount}
                  onChange={(e) => setAiCardCount(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                >
                  <option value={4}>4 بطاقات</option>
                  <option value={6}>6 بطاقات</option>
                  <option value={8}>8 بطاقات</option>
                  <option value={12}>12 بطاقة</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiGenModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCardsAI}
                  disabled={isGeneratingAi || !aiContent.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد البطاقات الآن</span>
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
