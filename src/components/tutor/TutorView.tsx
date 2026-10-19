import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { aiService } from '../../services/ai';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  BookOpen,
  User,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  RefreshCw,
  Copy,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  styleUsed?: string;
}

interface TutorViewProps {
  setCurrentTab: (tab: string) => void;
}

export const TutorView: React.FC<TutorViewProps> = () => {
  const { user } = useAuth();
  const { subjects, addToast } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedStyle, setSelectedStyle] = useState<
    'simple' | 'detailed' | 'examples' | 'exam_focused' | 'socratic'
  >('simple');
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `أهلاً بك يا ${user?.name || 'صديقي'}! 🌟 أنا معلمك الذكي الشخصي في "ذاكرلي".
يمكنك أن تسألني عن أي مفهوم غامض، أو تطلب مسألة محلولة خطوة بخطوة، أو تطلب تلميحات ذكية.
اختر أسلوب الشرح المفضل لديك من الأعلى، واطرح سؤالك بكل ثقة!`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'اشرح لي هذا المفهوم بمثال بسيط من واقع الحياة',
    'أعطني مسألة امتحانات تدريبية على هذا الدرس',
    'ما هي الفخاخ الشائعة التي يقع فيها الطلاب في هذا السؤال؟',
    'أعطني تلميحاً فقط للحل دون حرق الإجابة',
    'لخص لي خطوات حل هذه المسألة في 3 خطوات',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: q.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    const sub = subjects.find((s) => s.id === selectedSubjectId);

    const answer = await aiService.askTutor({
      question: q.trim(),
      style: selectedStyle,
      grade: user?.grade,
      subject: sub?.name || 'عام',
      history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
    });

    const aiMsg: ChatMessage = {
      id: 'ai_' + Date.now(),
      role: 'assistant',
      content: answer,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      styleUsed: selectedStyle,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: 'تم بدء محادثة جديدة. تفضل بطرح سؤالك التالي!',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    addToast('تم مسح سجل المحادثة', 'info');
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('تم نسخ الرد', 'success');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Top Bar: Subject & Style Picker */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">المعلم الذكي</h2>
              <span className="text-[10px] text-slate-400">مساعدك الأكاديمي التفاعلي</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Subject Context */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-bold">المادة:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Style Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-bold">الأسلوب:</span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="simple">تبسيط سلس وأمثلة حياتية</option>
              <option value="detailed">شرح أكاديمي معمق</option>
              <option value="examples">مسائل وأمثلة محلولة خطوة بخطوة</option>
              <option value="exam_focused">أسلوب امتحانات ونقاط ذهبية</option>
              <option value="socratic">علمني بالأسئلة (تلميحات ذكية)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
          title="بدء محادثة جديدة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {msg.content}

                <div
                  className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] ${
                    isUser ? 'border-white/20 text-white/70' : 'border-slate-200/50 dark:border-slate-700/50 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.content)}
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> نسخ الشرح
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-xs bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span>المعلم الذكي يفكر ويكتب الشرح النموذجي...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 scrollbar-none">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mr-1" />
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="اكتب سؤالك، معادلتك، أو ما تريد فهمه هنا..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40 transition-all cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
