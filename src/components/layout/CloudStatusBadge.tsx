import React, { useState } from 'react';
import { Database, ShieldCheck, Info, X } from 'lucide-react';

export const CloudStatusBadge: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
        title="حالة تخزين البيانات والمزامنة"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">التخزين: محلي آمن</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  حالة حفظ البيانات والخصوصية
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  شفافية كاملة حول كيفية حفظ بياناتك
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  التخزين المحلي المشفر (نشط)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  يتم حفظ جميع جلسات المذاكرة، الملخصات، البطاقات، والمهام تلقائياً وفورياً على جهازك دون انقطاع. يمكنك تصدير بياناتك في أي وقت كملف JSON أو CSV.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  <Info className="w-4 h-4" />
                  المزامنة السحابية (Firebase Cloud Firestore)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  إذا أردت ربط حسابك بـ Firebase سحابياً للمزامنة عبر أجهزة متعددة، يمكنك ضبط إعدادات المشروع وقواعد الأمان من صفحة الإعدادات. التطبيق لا يدعي المزامنة السحابية إذا لم يتم ربطها.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
