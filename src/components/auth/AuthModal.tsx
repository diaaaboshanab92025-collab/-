import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EducationalSystem, EducationalStage } from '../../types';
import { BookOpen, X, Sparkles, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, loginAsDemo } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [system, setSystem] = useState<EducationalSystem>('egyptian_general');
  const [stage, setStage] = useState<EducationalStage>('secondary');
  const [grade, setGrade] = useState('الصف الثالث الثانوي');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('يرجى ملء جميع الحقول');
        return;
      }
      await login(email, password);
      onClose();
    } else if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('يرجى ملء الاسم والبريد الإلكتروني وكلمة المرور');
        return;
      }
      await signup({
        name,
        email,
        system,
        stage,
        grade,
        dailyGoalMinutes: Number(dailyGoalMinutes),
      });
      onClose();
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('يرجى إدخال بريدك الإلكتروني لاستلام رابط الاستعادة');
        return;
      }
      setResetSent(true);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {mode === 'login'
              ? 'تسجيل الدخول إلى ذاكرلي'
              : mode === 'signup'
              ? 'إنشاء حساب طالب جديد'
              : 'استعادة كلمة المرور'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'أهلاً بعودتك! تابع جلسات مذاكرتك وتقدمك'
              : mode === 'signup'
              ? 'انضم لمنصة المذاكرة الذكية وخصص جدولك'
              : 'أدخل بريدك وسنرسل لك تعليمات إعادة الضبط'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            {errorMsg}
          </div>
        )}

        {resetSent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center space-y-3">
            <p className="font-bold">تم إرسال رابط استعادة كلمة المرور إلى {email} بنجاح!</p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="text-xs font-bold text-emerald-700 underline"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: يوسف أحمد"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      النظام التعليمي
                    </label>
                    <select
                      value={system}
                      onChange={(e) => setSystem(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                    >
                      <option value="egyptian_general">عام مصري</option>
                      <option value="al_azhar">أزهري</option>
                      <option value="saudi">سعودي</option>
                      <option value="general_arab">عربي عام</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      المرحلة
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                    >
                      <option value="primary">ابتدائي</option>
                      <option value="preparatory">إعدادي / متوسط</option>
                      <option value="secondary">ثانوي</option>
                      <option value="university">جامعي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    الصف الدراسي
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="الصف الثالث الثانوي"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-2"
            >
              {mode === 'login'
                ? 'دخول إلى حسابي'
                : mode === 'signup'
                ? 'إنشاء الحساب وبدء المذاكرة'
                : 'إرسال رابط الاستعادة'}
            </button>

            {/* Fast 1-click Demo Student Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>تجربة فورية بحساب طالب تجريبي جاهز</span>
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="hover:underline text-slate-400"
              >
                نسيت كلمة المرور؟
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-emerald-600 hover:underline"
              >
                حساب جديد
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-bold text-emerald-600 hover:underline mx-auto"
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
