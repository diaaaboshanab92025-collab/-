import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Timer,
  Layers,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Video,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const features = [
    {
      icon: Sparkles,
      color: 'bg-indigo-500 text-white',
      title: 'ملخصات ذكية فورية',
      description:
        'حوّل أصعب الفصول والمذكرات إلى ملخصات هيكلية دقيقة تستخرج المفاهيم والقوانين وأسئلة الامتحانات المتوقعة.',
    },
    {
      icon: Layers,
      color: 'bg-purple-500 text-white',
      title: 'بطاقات التكرار المتباعد (SM-2)',
      description:
        'مستوحى من منهجية Anki لترسيخ المعلومات في الذاكرة طويلة المدى ومكافحة منحنى النسيان بجدولة علمية دقيقة.',
    },
    {
      icon: Timer,
      color: 'bg-emerald-500 text-white',
      title: 'مؤقت التركيز والبومودورو',
      description:
        'احسب ساعات دراستك الفعلية حصراً دون احتساب فترات التوقف، مع حفظ الجلسات وتفادي ازدواج السجلات.',
    },
    {
      icon: HelpCircle,
      color: 'bg-amber-500 text-white',
      title: 'المعلم الذكي وبنك الاختبارات',
      description:
        'اسأل معلمك في أي وقت، واطلب مسائل محلولة خطوة بخطوة، واختبر فهمك بأسئلة تقييمية مع شروحات نموذجية.',
    },
    {
      icon: Video,
      color: 'bg-teal-500 text-white',
      title: 'فيديوهات الشرح ولوحات القصة',
      description:
        'شاهد شروحات الدروس وقسّمها إلى مشاهد ورسوم توضيحية مع تتبع استيعابك لكل جزئية بدقة.',
    },
    {
      icon: BarChart3,
      color: 'bg-rose-500 text-white',
      title: 'إحصاءات وتقارير تقدم حقيقية',
      description:
        'مخططات بيانية لآخر 7 أيام، ونسب إنجاز الأهداف اليومية والأسبوعية، وتوصيات أسبوعية مخصصة للتحسين.',
    },
  ];

  const faqs = [
    {
      q: 'كيف تضمن منصة "ذاكرلي" دقة التلخيصات والشروحات؟',
      a: 'تعتمد المنصة بشكل أساسي على المادة العلمية المرفقة من الطالب؛ حيث يستخرج الذكاء الاصطناعي المفاهيم والقوانين من النص نفسه دون اختلاق وقائع، مع إبراز خطوات الحل العلمي بدقة.',
    },
    {
      q: 'ما هي خوارزمية التكرار المتباعد المتبعة في البطاقات؟',
      a: 'نستخدم خوارزمية SuperMemo-2 (SM-2) القياسية التي تحسب فترات المراجعة بناءً على تقييمك الحقيقي لسهولة استدعاء المعلومة (نسيت، صعب، جيد، سهل جداً) لضمان تذكرها في موعد الامتحان.',
    },
    {
      q: 'هل يمكنني استخدام المنصة بدون إنترنت أو تصدير بياناتي؟',
      a: 'نعم تماماً! تحتفظ المنصة ببياناتك على جهازك بشكل آمن عبر التخزين المحلي المشفر، وتتيح لك تصدير سجلاتك كاملة بصيغتي JSON و CSV في أي وقت بضغطة زر واحدة.',
    },
    {
      q: 'هل المنصة مناسبة لجميع المناهج والمراحل؟',
      a: 'نعم، تدعم المنصة مناهج التعليم العام المصري، والتعليم الأزهري، والمنهاج السعودي، والمناهج العربية، مع مرونة تامة لإضافة وتعديل المواد والفصول حسب رغبتك.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Landing Navigation */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">ذاكرلي</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Zakerly
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer px-3 py-1.5"
          >
            تسجيل الدخول
          </button>
          <button
            onClick={onEnterApp}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            ابدأ المذاكرة الآن
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>منصة المذاكرة الذكية بالذكاء الاصطناعي للطلاب</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          ذاكر بذكاء، <span className="text-emerald-600 dark:text-emerald-400">تابع تقدمك</span>،
          وحقق هدفك الأكاديمي.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          نظم موادك الدراسية، لخص دروسك بالذكاء الاصطناعي، احفظ بفعالية مع بطاقات التكرار المتباعد،
          وتتبّع ساعات دراستك الحقيقية نحو الامتحانات بثقة كاملة.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>دخول لوحة التحكم المباشرة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base hover:bg-slate-100 transition-colors cursor-pointer"
          >
            إنشاء حساب طالب جديد
          </button>
        </div>

        {/* Live Interactive UI Showcase Preview */}
        <div className="pt-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xl relative overflow-hidden text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-400 mr-2">
                  لوحة تحكم طالب ذاكرلي
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span>حماس متواصل</span>
              </div>
            </div>

            {/* Showcase mini grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">هدف المذاكرة اليومي</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  95 / 150 دقيقة (63%)
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="w-[63%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">استرجاع البطاقات (SM-2)</span>
                <div className="text-xl font-black text-purple-600">88% دقة تذكر</div>
                <span className="text-[10px] text-slate-500">مراجعة 24 بطاقة مستحقة اليوم</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">الامتحان القادم</span>
                <div className="text-xl font-black text-rose-600">متبقي 12 يوماً</div>
                <span className="text-[10px] text-slate-500">فيزياء: كهربية وقوانين كيرشوف</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            كل ما يحتاجه الطالب للتفوق في مكان واحد
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            ميزات عملية مصممة لرفع كفاءة الاستيعاب وتقليل التشتت بدلاً من الزخارف غير المجدية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-500 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            الأسئلة الشائعة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            إجابات واضحة وشفافة حول طريقة عمل منصة ذاكرلي.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-right font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy and Student Safety Statement */}
      <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              أمان وخصوصية تامة للطلاب
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              نلتزم بحماية بيانات الطلاب القُصّر ولا نقوم بجمع العناوين أو أرقام الهواتف غير الضرورية،
              مع توفير إمكانية تصدير أو حذف الحساب وكافة البيانات الشخصية فوراً.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-extrabold text-slate-800 dark:text-slate-200">
          ذاكرلي | Zakerly — منصة المذاكرة الذكية
        </p>
        <p className="text-[11px]">
          ذاكر بذكاء، تابع تقدمك، وحقق هدفك • جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};
