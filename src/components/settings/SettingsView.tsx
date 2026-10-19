import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';
import {
  Settings,
  User,
  Download,
  Trash2,
  Moon,
  Sun,
  Shield,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SettingsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const { user, updateProfile, deleteAccount, theme, toggleTheme } = useAuth();
  const { addToast } = useStudy();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [system, setSystem] = useState(user?.system || 'egyptian_general');
  const [stage, setStage] = useState(user?.stage || 'secondary');
  const [grade, setGrade] = useState(user?.grade || 'الصف الثالث الثانوي');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 120);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(user?.weeklyGoalHours || 14);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      system: system as any,
      stage: stage as any,
      grade,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      weeklyGoalHours: Number(weeklyGoalHours),
    });
    addToast('تم حفظ تعديلات الملف الشخصي بنجاح', 'success');
  };

  const handleExportJSON = () => {
    const jsonStr = storage.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zakerly_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('تم تحميل نسخة احتياطية بصيغة JSON بنجاح', 'success');
  };

  const handleExportCSV = () => {
    const csvStr = storage.exportSessionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zakerly_study_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('تم تصدير سجل جلسات المذاكرة بصيغة CSV بنجاح', 'success');
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من استعادة البيانات التجريبية الافتراضية؟')) {
      storage.resetToDefault();
      addToast('تمت استعادة البيانات الافتراضية بنجاح', 'info');
    }
  };

  const handleDeleteAccountSubmit = () => {
    deleteAccount();
    addToast('تم حذف الحساب وكافة البيانات الشخصية بنجاح', 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          <span>الإعدادات والملف الشخصي</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          خصص نظامك التعليمي، أهدافك اليومية، وحمّل بياناتك في أي وقت.
        </p>
      </div>

      {/* Profile & Academic Details Form */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              البيانات الأكاديمية والشخصية
            </h3>
            <p className="text-xs text-slate-500">
              تساعد هذه البيانات المعلم الذكي على تكييف الشروحات لمستواك ومرحلتك.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الطالب الكامل
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                النظام التعليمي
              </label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                <option value="egyptian_general">التعليم العام المصري</option>
                <option value="al_azhar">التعليم الأزهري الشريف</option>
                <option value="saudi">المنهاج السعودي</option>
                <option value="general_arab">منهاج عربي عام</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المرحلة الدراسية
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                <option value="primary">المرحلة الابتدائية</option>
                <option value="preparatory">المرحلة الإعدادية / المتوسطة</option>
                <option value="secondary">المرحلة الثانوية</option>
                <option value="university">المرحلة الجامعية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصف الدراسي
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="الصف الثالث الثانوي"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هدف المذاكرة اليومي (بالدقائق)
              </label>
              <input
                type="number"
                min="15"
                max="720"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                يعادل {Math.round(dailyGoalMinutes / 60)} ساعات و {dailyGoalMinutes % 60} دقيقة يومياً.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هدف المذاكرة الأسبوعي (بالساعات)
              </label>
              <input
                type="number"
                min="1"
                max="70"
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>

      {/* Data Export & Backup Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              تصدير البيانات والنسخ الاحتياطي
            </h3>
            <p className="text-xs text-slate-500">
              بياناتك ملكك بالكامل. يمكنك تنزيل نسخة من جلساتك وملاحظاتك بصيغ قياسية في أي وقت.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-right cursor-pointer group"
          >
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                تصدير نسخة كاملة (JSON)
              </span>
              <span className="text-[10px] text-slate-500">
                يشمل كافة المواد، المهام، البطاقات، والملخصات
              </span>
            </div>
            <Download className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={handleExportCSV}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-right cursor-pointer group"
          >
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                تصدير جلسات المذاكرة (CSV)
              </span>
              <span className="text-[10px] text-slate-500">
                جدول إكسل متوافق لتحليل ساعات المذاكرة
              </span>
            </div>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Cloud & Firebase Transparency */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              حالة التخزين والمزامنة السحابية
            </h3>
            <p className="text-xs text-slate-500">
              شفافية وأمان: التخزين المحلي نشط حالياً ويعمل دون الحاجة لاتصال خارجي.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            التخزين المحلي الآمن (Active Local Storage)
          </div>
          <p>
            تُحفظ كافة بيانات المذاكرة والمهام والبطاقات على جهازك فوراً. إذا رغبت في ربط حسابك
            بـ Firebase Cloud Firestore، يتطلب ذلك تهيئة مشروع Firebase وضبط متغيرات البيئة.
          </p>
        </div>
      </div>

      {/* Dangerous zone: Reset Data / Delete Account */}
      <div className="rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 sm:p-8 space-y-4">
        <h3 className="font-extrabold text-rose-700 dark:text-rose-400 text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>منطقة الإجراءات الحساسة</span>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              استعادة البيانات النموذجية الافتراضية
            </span>
            <span className="text-[10px] text-slate-500">
              يعيد تعيين بيانات المواد والتجربة الأولية
            </span>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            استعادة النماذج الافتراضية
          </button>
        </div>

        <div className="pt-3 border-t border-rose-200/60 dark:border-rose-800/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
              حذف الحساب ومسح كافة البيانات نهائياً
            </span>
            <span className="text-[10px] text-slate-500">
              إزالة لا يمكن التراجع عنها لكل جلسات المذاكرة والملخصات
            </span>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            حذف الحساب نهائياً
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              تأكيد حذف الحساب نهائياً
            </h3>
            <p className="text-xs text-slate-500">
              سيتم مسح كافة سجلات المذاكرة والبطاقات فوراً. هل تريد المتابعة؟
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccountSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                نعم، احذف الحساب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
