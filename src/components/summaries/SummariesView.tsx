import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { aiService } from '../../services/ai';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Printer,
  Layers,
  HelpCircle,
  Trash2,
  Bookmark,
  Share2,
  RefreshCw,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface SummariesViewProps {
  setCurrentTab: (tab: string) => void;
}

export const SummariesView: React.FC<SummariesViewProps> = ({ setCurrentTab }) => {
  const { subjects, summaries, addSummary, deleteSummary, addCard, addDeck, addToast } = useStudy();

  const [inputContent, setInputContent] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [summaryType, setSummaryType] = useState<
    'short' | 'detailed' | 'structured' | 'key_concepts' | 'exam_questions'
  >('structured');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  // Sample texts for 1-click test
  const sampleLessons = [
    {
      title: 'فيزياء: قانونا كيرشوف',
      subjectId: 'sub_physics',
      text: `ينص قانون كيرشوف الأول على أن المجموع الجبري للتيارات الكهربية الداخلة عند نقطة تفرع في دائرة مغلقة يساوي المجموع الجبري للتيارات الخارجة منها: Σ I_in = Σ I_out. ويعتمد هذا القانون علمياً على مبدأ حفظ الشحنة الكهربية.
أما قانون كيرشوف الثاني فينص على أنه في أي مسار مغلق في دائرة كهربية، يكون المجموع الجبري للقوى الدافعة الكهربية للبطاريات مساوياً للمجموع الجبري لفروق الجهد الكهربي عبر المقاومات: Σ VB = Σ (I * R). ويعتمد هذا القانون على مبدأ حفظ الطاقة في الدوائر المغلقة.`,
    },
    {
      title: 'نحو: إعمال اسم الفاعل',
      subjectId: 'sub_arabic',
      text: `اسم الفاعل هو اسم مشتق من الفعل المبني للمعلوم للدلالة على من قام بالفعل أو اتصف به.
يعمل اسم الفاعل عمل فعله فيرفع فاعلاً وينصب مفعولاً به أو أكثر:
1. إذا كان مقترناً بـ (أل): يعمل بلا شرط ولا قيد سواء دل على الماضي أو الحاضر أو المستقبل (مثل: المكرمُ ضيفَه مشكورٌ).
2. إذا كان مجرداً من (أل): يعمل بشرطين أساسيين:
- أ) أن يدل على الحال أو الاستقبال (لا الماضي).
- ب) أن يعتمد على: مبتدأ، أو نفي، أو استفهام، أو موصوف، أو نداء، أو يقع حالاً.`,
    },
  ];

  const handleLoadSample = (sample: typeof sampleLessons[0]) => {
    setInputContent(sample.text);
    if (subjects.some((s) => s.id === sample.subjectId)) {
      setSelectedSubjectId(sample.subjectId);
    }
  };

  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      addToast('يرجى لصق أو كتابة محتوى الدرس أولاً.', 'error');
      return;
    }

    setIsLoading(true);
    setGeneratedSummary(null);

    const sub = subjects.find((s) => s.id === selectedSubjectId);
    const result = await aiService.generateSummary({
      content: inputContent,
      type: summaryType,
      difficulty,
      subject: sub?.name || 'عام',
    });

    setGeneratedSummary(result);
    setIsLoading(false);
  };

  const handleSaveSummary = () => {
    if (!generatedSummary) return;
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    const title = inputContent.split('\n')[0].slice(0, 50) || 'تلخيص درس';

    addSummary({
      title: `تلخيص: ${title}`,
      subjectId: selectedSubjectId || subjects[0]?.id || 'sub_general',
      originalText: inputContent,
      summaryText: generatedSummary,
      type: summaryType,
      difficulty,
    });
  };

  const handleCopy = () => {
    if (!generatedSummary) return;
    navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('تم نسخ التلخيص إلى الحافظة', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConvertToFlashcards = async () => {
    if (!generatedSummary) return;
    addToast('جاري استخراج البطاقات التعليمية من التلخيص...', 'info');
    const cardsData = await aiService.generateFlashcards({
      content: generatedSummary,
      subject: subjects.find((s) => s.id === selectedSubjectId)?.name || '',
    });

    if (cardsData && Array.isArray(cardsData.cards)) {
      const newDeck = addDeck({
        title: cardsData.deckTitle || 'حزمة بطاقات من التلخيص',
        description: 'تم إنشاؤها آلياً من التلخيص الذكي',
        subjectId: selectedSubjectId || subjects[0]?.id || 'sub_general',
      });

      cardsData.cards.forEach((c: any) => {
        addCard({
          deckId: newDeck.id,
          front: c.front,
          back: c.back,
          hint: c.hint,
          category: c.category,
        });
      });

      addToast(`تم تحويل التلخيص إلى ${cardsData.cards.length} بطاقات استذكار بنجاح!`, 'success');
      setCurrentTab('flashcards');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>مولد الملخصات الذكي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            لخص دروسك في ثوانٍ، استخرج القوانين والمفاهيم، وحوّلها لبطاقات استذكار فورية.
          </p>
        </div>

        {/* Tab switch: create vs saved */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            توليد تلخيص جديد
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الملخصات المحفوظة ({summaries.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Input Workspace (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  الصق نص الدرس أو الملاحظات:
                </span>

                {/* Sample quick picks */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400">نماذج تجريبية:</span>
                  {sampleLessons.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 cursor-pointer"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={9}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="الصق هنا نص الدرس أو شرح المعلم أو الملاحظات التي ترغب في تلخيصها..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    المادة الدراسية:
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
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
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    نوع وشكل التلخيص:
                  </label>
                  <select
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="structured">هيكلي منظم بعناوين</option>
                    <option value="short">موجز مركز (أهم النقاط)</option>
                    <option value="detailed">تفصيلي وشامل</option>
                    <option value="key_concepts">استخراج المفاهيم والقوانين فقط</option>
                    <option value="exam_questions">أهم أسئلة الامتحانات المتوقعة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    المستوى والعمق:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="easy">مبسط جداً</option>
                    <option value="medium">متوسط (منهج مدرسي)</option>
                    <option value="hard">متقدم وأكاديمي</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !inputContent.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل الدرس وتوليد التلخيص الذكي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد التلخيص بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right / Generated Output View (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>النتيجة التعليمية</span>
                </span>

                {generatedSummary && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="نسخ"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="طباعة"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveSummary}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700"
                    >
                      حفظ في موادي
                    </button>
                  </div>
                )}
              </div>

              {/* Summary Text Content */}
              <div className="flex-1 overflow-y-auto py-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                    <Sparkles className="w-8 h-8 text-indigo-500 animate-bounce" />
                    <p className="text-xs font-semibold">
                      يقوم الذكاء الاصطناعي الآن بقراءة وتحليل النص بدقة...
                    </p>
                  </div>
                ) : generatedSummary ? (
                  generatedSummary
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-medium">
                      الصق نص الدرس واضغط "توليد التلخيص" لتظهر النتيجة المنظمة هنا.
                    </p>
                  </div>
                )}
              </div>

              {/* Conversion bar */}
              {generatedSummary && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={handleConvertToFlashcards}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>تحويل إلى بطاقات استذكار</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Saved Summaries List */
        <div className="space-y-3">
          {summaries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              لم تحفظ أي ملخصات بعد. قم بتوليد ملخصك الأول الآن!
            </div>
          ) : (
            summaries.map((sum) => {
              const sub = subjects.find((s) => s.id === sum.subjectId);
              return (
                <div
                  key={sum.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub?.color || '#10b981' }}
                      />
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {sum.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">{sum.createdAt}</span>
                    </div>

                    <button
                      onClick={() => deleteSummary(sum.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {sum.summaryText}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
