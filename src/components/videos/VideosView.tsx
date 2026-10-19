import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { aiService } from '../../services/ai';
import { VideoLesson } from '../../types';
import {
  Video,
  Play,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Film,
  Layers,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';

interface VideosViewProps {
  setCurrentTab: (tab: string) => void;
}

export const VideosView: React.FC<VideosViewProps> = ({ setCurrentTab }) => {
  const { videos, subjects, addVideo, updateVideo, deleteVideo, addToast } = useStudy();

  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(videos[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStoryboardModal, setShowStoryboardModal] = useState(false);

  // Add video form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');

  // AI Storyboard generator state
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptDuration, setScriptDuration] = useState(3);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Parse YouTube URL to embed
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const embed = getEmbedUrl(newUrl.trim());

    const created = addVideo({
      title: newTitle.trim(),
      videoUrl: newUrl.trim() || undefined,
      embedUrl: embed || undefined,
      subjectId: newSubjectId,
      notes: newNotes.trim() || undefined,
      understoodStatus: 'unwatched',
    });

    setSelectedVideo(created);
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleGenerateStoryboard = async () => {
    if (!scriptTopic.trim()) {
      addToast('يرجى كتابة عنوان الدرس لتوليد السيناريو', 'error');
      return;
    }

    setIsGeneratingScript(true);
    const sub = subjects.find((s) => s.id === newSubjectId);

    const storyboard = await aiService.generateVideoScript({
      topic: scriptTopic,
      content: scriptContent,
      targetMinutes: scriptDuration,
      subject: sub?.name || 'عام',
    });

    if (storyboard && Array.isArray(storyboard.scenes)) {
      const created = addVideo({
        title: storyboard.title || scriptTopic,
        subjectId: newSubjectId,
        notes: storyboard.summary,
        understoodStatus: 'unwatched',
        storyboard,
      });

      setSelectedVideo(created);
      setShowStoryboardModal(false);
      setScriptTopic('');
      setScriptContent('');
      addToast('تم توليد سيناريو ولوحة قصة الدرس بنجاح! 🎬', 'success');
    }
    setIsGeneratingScript(false);
  };

  const handleUpdateStatus = (
    status: 'understood' | 'partial' | 'needs_review' | 'unwatched'
  ) => {
    if (!selectedVideo) return;
    updateVideo(selectedVideo.id, { understoodStatus: status });
    setSelectedVideo({ ...selectedVideo, understoodStatus: status });
    addToast('تم تحديث حالة استيعاب الدرس', 'info');
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || v.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-teal-600" />
            <span>فيديوهات الشرح وسيناريو الدروس</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            مكتبة مرئية متكاملة لدروسك مع لوحات قصة ذكية مُقسمة إلى مشاهد ورسوم توضيحية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStoryboardModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>توليد سيناريو AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط فيديو</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Player + Library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Video & Lesson Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedVideo ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Embed or Storyboard Screen */}
              {selectedVideo.embedUrl ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={selectedVideo.embedUrl}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* Storyboard visual card */
                <div className="p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center text-center space-y-3">
                  <Film className="w-12 h-12 text-teal-400" />
                  <h3 className="text-lg font-black">{selectedVideo.title}</h3>
                  <p className="text-xs text-indigo-200 max-w-md">
                    هذا الدرس موثق كلوحة قصة (Storyboard) وسيناريو تعليمي ذكي مقسم إلى مشاهد أدناه.
                  </p>
                </div>
              )}

              {/* Video metadata and interactive actions */}
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedVideo.title}
                    </h2>
                    <span className="text-xs text-slate-500">
                      المادة:{' '}
                      {subjects.find((s) => s.id === selectedVideo.subjectId)?.name || 'عام'}
                    </span>
                  </div>

                  {/* Understanding Status Pill Buttons */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
                    <button
                      onClick={() => handleUpdateStatus('understood')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedVideo.understoodStatus === 'understood'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      فهمت تماماً 👍
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('partial')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedVideo.understoodStatus === 'partial'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                      }`}
                    >
                      فهم جزئي 🤏
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('needs_review')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedVideo.understoodStatus === 'needs_review'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      يحتاج مراجعة 🔁
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {selectedVideo.notes && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold block mb-1 text-slate-900 dark:text-white">
                      ملاحظات حول الدرس:
                    </span>
                    {selectedVideo.notes}
                  </div>
                )}

                {/* AI Storyboard Scenes if available */}
                {selectedVideo.storyboard && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-indigo-500" />
                      <span>مشاهد لوحة القصة والسيناريو التعليمي:</span>
                    </h3>

                    <div className="space-y-3">
                      {selectedVideo.storyboard.scenes.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-indigo-600 dark:text-indigo-400">
                              مشهد {scene.sceneNumber}: {scene.title}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" /> {scene.durationSeconds} ثانية
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <p>
                              <strong className="text-slate-900 dark:text-white">
                                ما يظهر على الشاشة:
                              </strong>{' '}
                              {scene.visuals}
                            </p>
                            <p className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 italic">
                              "{scene.narration}"
                            </p>
                          </div>

                          {scene.keyTakeaway && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                              الهدف: {scene.keyTakeaway}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions: open quiz or flashcards on this subject */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentTab('quizzes')}
                    className="flex-1 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>اختبر فهمك لهذا الدرس</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('flashcards')}
                    className="flex-1 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>مراجعة بطاقات المادة</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
              اختر درساً من القائمة لعرضه هنا.
            </div>
          )}
        </div>

        {/* Right Column: Search & Video Playlist (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Subject filter */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
            >
              <option value="all">جميع المواد الدراسية</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Videos List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredVideos.map((vid) => {
              const isSelected = selectedVideo?.id === vid.id;
              const sub = subjects.find((s) => s.id === vid.subjectId);
              return (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: sub?.color || '#10b981' }}
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {vid.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {sub?.name || 'مادة عامة'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVideo(vid.id);
                        if (selectedVideo?.id === vid.id) setSelectedVideo(null);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      {vid.embedUrl ? <Video className="w-3 h-3" /> : <Film className="w-3 h-3 text-indigo-500" />}
                      {vid.embedUrl ? 'فيديو مضمن' : 'لوحة قصة AI'}
                    </span>
                    <span
                      className={`font-bold ${
                        vid.understoodStatus === 'understood'
                          ? 'text-emerald-600'
                          : vid.understoodStatus === 'needs_review'
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {vid.understoodStatus === 'understood'
                        ? 'تم الفهم'
                        : vid.understoodStatus === 'needs_review'
                        ? 'يحتاج مراجعة'
                        : vid.understoodStatus === 'partial'
                        ? 'فهم جزئي'
                        : 'لم يشاهد'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Add Video Link */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              إضافة فيديو شرح تعليمي
            </h3>

            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الفيديو أو الدرس *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: شرح قوانين كيرشوف المعقدة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الفيديو (YouTube)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة المرتبطة
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
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
                  ملاحظات إضافية
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ملاحظات مهمة ذكرها المعلم أثناء الشرح..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  إضافة الفيديو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Storyboard & Video Script Generator */}
      {showStoryboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowStoryboardModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  توليد سيناريو ولوحة قصة الدرس (AI Storyboard)
                </h3>
                <p className="text-xs text-slate-500">
                  يقوم الذكاء الاصطناعي بتقسيم درسك إلى مشاهد مرئية ورسوم مقترحة ونص صوتي.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  required
                  value={scriptTopic}
                  onChange={(e) => setScriptTopic(e.target.value)}
                  placeholder="مثال: كيفية إيجاد معادلة المماس والعمودي..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة المرتبطة
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
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
                  محتوى الدرس أو أهم النقاط التي تريد شرحها
                </label>
                <textarea
                  rows={4}
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="الصق نقاط الدرس أو الشرح..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoryboardModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleGenerateStoryboard}
                  disabled={isGeneratingScript || !scriptTopic.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري توليد السيناريو...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد لوحة القصة الآن</span>
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
