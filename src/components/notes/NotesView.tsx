import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { StudyNote } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Star,
  Search,
  Tag,
  Printer,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  FileText,
} from 'lucide-react';

interface NotesViewProps {
  setCurrentTab: (tab: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ setCurrentTab }) => {
  const { notes, subjects, addNote, updateNote, deleteNote, addToast } = useStudy();

  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(notes[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit/create state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState(subjects[0]?.id || '');
  const [noteTags, setNoteTags] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteSubjectId(subjects[0]?.id || '');
    setNoteTags('');
    setShowEditModal(true);
  };

  const handleOpenEdit = (note: StudyNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubjectId(note.subjectId);
    setNoteTags(note.tags.join(', '));
    setShowEditModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const tagsArray = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: noteTitle.trim(),
        content: noteContent,
        subjectId: noteSubjectId,
        tags: tagsArray,
      });
      if (selectedNote?.id === editingNoteId) {
        setSelectedNote({
          ...selectedNote,
          title: noteTitle.trim(),
          content: noteContent,
          subjectId: noteSubjectId,
          tags: tagsArray,
        });
      }
    } else {
      const created = addNote({
        title: noteTitle.trim(),
        content: noteContent,
        subjectId: noteSubjectId,
        tags: tagsArray,
        isFavorite: false,
      });
      setSelectedNote(created);
    }

    setShowEditModal(false);
  };

  const toggleFavorite = (note: StudyNote) => {
    updateNote(note.id, { isFavorite: !note.isFavorite });
    if (selectedNote?.id === note.id) {
      setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === 'all' || n.subjectId === selectedSubjectId;
    const matchesFav = !showOnlyFavorites || n.isFavorite;
    return matchesSearch && matchesSubject && matchesFav;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
            <span>مكتبة الملاحظات والمعرفة الأكاديمية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            سجل ملاحظات الدروس، رتّبها حسب المواد والوسوم، وحوّلها لملخصات واختبارات.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>ملاحظة جديدة</span>
        </button>
      </div>

      {/* Grid: Notes list (4 cols) + Reader / Editor (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notes directory */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filters */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في ملاحظاتك..."
                className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                <option value="all">كافة المواد</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowOnlyFavorites((prev) => !prev)}
                className={`p-2 rounded-xl border transition-colors ${
                  showOnlyFavorites
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
                title="المفضلة فقط"
              >
                <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-amber-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Notes list cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              const sub = subjects.find((s) => s.id === note.subjectId);
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub?.color || '#10b981' }}
                      />
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                        {note.title}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note);
                      }}
                      className="text-slate-300 hover:text-amber-500"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          note.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {note.content.replace(/[#*`]/g, '')}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{sub?.name || 'عام'}</span>
                    <span>{note.updatedAt.split('T')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Note Document Viewer */}
        <div className="lg:col-span-8">
          {selectedNote ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Note Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white"
                      style={{
                        backgroundColor:
                          subjects.find((s) => s.id === selectedNote.subjectId)?.color || '#10b981',
                      }}
                    >
                      {subjects.find((s) => s.id === selectedNote.subjectId)?.name || 'عام'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      آخر تعديل: {selectedNote.updatedAt.split('T')[0]}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedNote.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(selectedNote)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="طباعة"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      deleteNote(selectedNote.id);
                      setSelectedNote(null);
                    }}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-600 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedNote.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Note Content */}
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap min-h-[220px]">
                {selectedNote.content}
              </div>

              {/* Action Toolbar to convert note */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 ml-2">تحويل هذه الملاحظة:</span>
                <button
                  onClick={() => setCurrentTab('summaries')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>تلخيص AI</span>
                </button>
                <button
                  onClick={() => setCurrentTab('flashcards')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>بطاقات استذكار</span>
                </button>
                <button
                  onClick={() => setCurrentTab('quizzes')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>اختبار تدريبي</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              اختر ملاحظة لعرض تفاصيلها أو أنشئ ملاحظة جديدة.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Note */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingNoteId ? 'تعديل الملاحظة' : 'إنشاء ملاحظة جديدة'}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الملاحظة *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="مثال: قوانين الحركة والسرعة النسبية..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المادة المرتبطة
                  </label>
                  <select
                    value={noteSubjectId}
                    onChange={(e) => setNoteSubjectId(e.target.value)}
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
                    الوسوم (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="مهم, قوانين, امتحان"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  محتوى الملاحظة
                </label>
                <textarea
                  rows={8}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="اكتب ملاحظاتك وشروحاتك هنا..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
