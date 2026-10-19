import {
  UserProfile,
  Subject,
  StudyTask,
  StudySession,
  FlashcardDeck,
  Flashcard,
  SummaryRecord,
  Quiz,
  QuizAttempt,
  VideoLesson,
  StudyNote,
  ExamEvent,
} from '../types';

const STORAGE_PREFIX = 'zakerly_';

export interface StorageData {
  user: UserProfile | null;
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  decks: FlashcardDeck[];
  cards: Flashcard[];
  summaries: SummaryRecord[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  videos: VideoLesson[];
  notes: StudyNote[];
  exams: ExamEvent[];
  cloudConfig: {
    isConfigured: boolean;
    projectId?: string;
    lastSynced?: string;
  };
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr_student_1',
  name: 'أحمد محمود',
  email: 'ahmed.student@example.com',
  system: 'egyptian_general',
  stage: 'secondary',
  grade: 'الصف الثالث الثانوي',
  dailyGoalMinutes: 150,
  weeklyGoalHours: 18,
  theme: 'light',
  createdAt: new Date().toISOString(),
  onboardingCompleted: true,
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_physics',
    userId: 'usr_student_1',
    name: 'الفيزياء',
    code: 'PHY-301',
    color: '#3b82f6', // blue
    icon: 'Atom',
    description: 'الكهربية والتيار المتردد، والفيزياء الحديثة',
    targetHoursWeekly: 4.5,
    createdAt: new Date().toISOString(),
    chapters: [
      { id: 'ch_p1', title: 'التيار الكهربي وقانون أوم وقانونا كيرشوف', order: 1, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_p2', title: 'التأثير المغناطيسي للتيار الكهربي', order: 2, isCompleted: true, confidenceLevel: 'medium' },
      { id: 'ch_p3', title: 'الحث الكهرومغناطيسي والمولد والمحول', order: 3, isCompleted: false, confidenceLevel: 'medium' },
      { id: 'ch_p4', title: 'الفيزياء الحديثة وإشعاع الجسم الأسود', order: 4, isCompleted: false, confidenceLevel: 'low' },
    ],
  },
  {
    id: 'sub_arabic',
    userId: 'usr_student_1',
    name: 'اللغة العربية',
    code: 'ARA-101',
    color: '#10b981', // emerald
    icon: 'BookOpen',
    description: 'النحو، الصرف، البلاغة، والأدب العربي',
    targetHoursWeekly: 4,
    createdAt: new Date().toISOString(),
    chapters: [
      { id: 'ch_a1', title: 'الوحدة الأولى: همزة الوصل والقطع وأحكام الهمزات', order: 1, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_a2', title: 'الوحدة الثانية: المشتقات العاملة وغير العاملة', order: 2, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_a3', title: 'الوحدة الثالثة: الجملة الاسمية والضمائر والنواسخ', order: 3, isCompleted: false, confidenceLevel: 'medium' },
      { id: 'ch_a4', title: 'الأدب: مدرسة الإحياء والبعث وجيل التطوير', order: 4, isCompleted: false, confidenceLevel: 'medium' },
    ],
  },
  {
    id: 'sub_math',
    userId: 'usr_student_1',
    name: 'الرياضيات (التفاضل والتكامل)',
    code: 'MTH-201',
    color: '#8b5cf6', // purple
    icon: 'Calculator',
    description: 'اشتقاق الدوال المثلثية وتطبيقات التفاضل',
    targetHoursWeekly: 5,
    createdAt: new Date().toISOString(),
    chapters: [
      { id: 'ch_m1', title: 'اشتقاق الدوال المثلثية والدوال الأسية واللوغاريتمية', order: 1, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_m2', title: 'المشتقات العليا ومعادلات المماس والعمودي', order: 2, isCompleted: false, confidenceLevel: 'medium' },
      { id: 'ch_m3', title: 'المعدلات الزمنية المرتبطة', order: 3, isCompleted: false, confidenceLevel: 'low' },
    ],
  },
  {
    id: 'sub_chemistry',
    userId: 'usr_student_1',
    name: 'الكيمياء',
    code: 'CHM-102',
    color: '#f59e0b', // amber
    icon: 'FlaskConical',
    description: 'العناصر الانتقالية والاتزان الكيميائي والكيمياء العضوية',
    targetHoursWeekly: 4,
    createdAt: new Date().toISOString(),
    chapters: [
      { id: 'ch_c1', title: 'الباب الأول: العناصر الانتقالية والحديد وسبائكه', order: 1, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_c2', title: 'الباب الثاني: التحليل الكيميائي الوصفي والكمي', order: 2, isCompleted: true, confidenceLevel: 'medium' },
      { id: 'ch_c3', title: 'الباب الثالث: الاتزان الكيميائي والأيوني', order: 3, isCompleted: false, confidenceLevel: 'medium' },
    ],
  },
  {
    id: 'sub_english',
    userId: 'usr_student_1',
    name: 'اللغة الإنجليزية',
    code: 'ENG-202',
    color: '#06b6d4', // cyan
    icon: 'Languages',
    description: 'Grammar, vocabulary, writing, and comprehension',
    targetHoursWeekly: 3,
    createdAt: new Date().toISOString(),
    chapters: [
      { id: 'ch_e1', title: 'Unit 1: Making Connections & Past Tenses', order: 1, isCompleted: true, confidenceLevel: 'high' },
      { id: 'ch_e2', title: 'Unit 2: Present Perfect vs Past Simple', order: 2, isCompleted: false, confidenceLevel: 'medium' },
    ],
  },
];

// Seed study sessions for realistic streak and chart visualization
const today = new Date();
const formatD = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_SESSIONS: StudySession[] = [
  {
    id: 'ses_1',
    userId: 'usr_student_1',
    subjectId: 'sub_physics',
    chapterId: 'ch_p2',
    durationMinutes: 50,
    date: formatD(0),
    startTime: `${formatD(0)}T10:00:00Z`,
    endTime: `${formatD(0)}T10:50:00Z`,
    type: 'pomodoro',
    notes: 'حل مسائل عزم الازدواج والجلفانومتر الحساس',
    focusRating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_2',
    userId: 'usr_student_1',
    subjectId: 'sub_math',
    chapterId: 'ch_m1',
    durationMinutes: 45,
    date: formatD(0),
    startTime: `${formatD(0)}T14:00:00Z`,
    endTime: `${formatD(0)}T14:45:00Z`,
    type: 'continuous',
    notes: 'مراجعة اشتقاق الدوال المثلثية العكسية واللوغاريتمية',
    focusRating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_3',
    userId: 'usr_student_1',
    subjectId: 'sub_arabic',
    chapterId: 'ch_a2',
    durationMinutes: 60,
    date: formatD(1),
    startTime: `${formatD(1)}T11:00:00Z`,
    endTime: `${formatD(1)}T12:00:00Z`,
    type: 'pomodoro',
    notes: 'تدريبات إعمال اسم الفاعل وصيغ المبالغة',
    focusRating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_4',
    userId: 'usr_student_1',
    subjectId: 'sub_chemistry',
    chapterId: 'ch_c1',
    durationMinutes: 75,
    date: formatD(2),
    startTime: `${formatD(2)}T16:00:00Z`,
    endTime: `${formatD(2)}T17:15:00Z`,
    type: 'pomodoro',
    notes: 'تفاعلات أكاسيد الحديد وخواص السبايك',
    focusRating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_5',
    userId: 'usr_student_1',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    durationMinutes: 90,
    date: formatD(3),
    startTime: `${formatD(3)}T10:00:00Z`,
    endTime: `${formatD(3)}T11:30:00Z`,
    type: 'continuous',
    notes: 'قوانين كيرشوف المعقدة وتوزيع التيارات في الدوائر المغلقة',
    focusRating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_6',
    userId: 'usr_student_1',
    subjectId: 'sub_math',
    chapterId: 'ch_m2',
    durationMinutes: 40,
    date: formatD(4),
    startTime: `${formatD(4)}T15:00:00Z`,
    endTime: `${formatD(4)}T15:40:00Z`,
    type: 'pomodoro',
    notes: 'تمارين المماس والعمودي ونقط الانقلاب',
    focusRating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ses_7',
    userId: 'usr_student_1',
    subjectId: 'sub_english',
    chapterId: 'ch_e1',
    durationMinutes: 50,
    date: formatD(5),
    startTime: `${formatD(5)}T12:00:00Z`,
    endTime: `${formatD(5)}T12:50:00Z`,
    type: 'pomodoro',
    notes: 'Grammar review on narrative past tenses',
    focusRating: 4,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'tsk_1',
    userId: 'usr_student_1',
    title: 'حل أسئلة كتاب الامتحان على قانوني كيرشوف',
    description: 'التركيز على المسائل ذات المسارات المتعددة وحساب فرق الجهد بين نقطتين',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    dueDate: formatD(0),
    dueTime: '18:00',
    estimatedMinutes: 60,
    actualMinutes: 55,
    priority: 'high',
    status: 'completed',
    subtasks: [
      { id: 'st_1', title: 'حل المسائل من 1 إلى 15', isCompleted: true },
      { id: 'st_2', title: 'مراجعة إشارات فروق الجهد في الحلقات المغلقة', isCompleted: true },
    ],
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_2',
    userId: 'usr_student_1',
    title: 'تلخيص قواعد إعمال المشتقات في النحو',
    description: 'اسم الفاعل، صيغ المبالغة، واسم المفعول مع شروط العمل',
    subjectId: 'sub_arabic',
    chapterId: 'ch_a2',
    dueDate: formatD(0),
    dueTime: '21:00',
    estimatedMinutes: 45,
    priority: 'high',
    status: 'in_progress',
    subtasks: [
      { id: 'st_3', title: 'كتابة شروط عمل المحلى بأل', isCompleted: true },
      { id: 'st_4', title: 'كتابة شروط عمل المجرد من أل (الاعتماد على نفي/استفهام/مبتدأ)', isCompleted: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_3',
    userId: 'usr_student_1',
    title: 'مراجعة معادلات الحديد والأكاسيد (الثنائي والثلاثي والمغناطيسي)',
    description: 'رسم المخطط السهمي لتحويلات الحديد وطرق الاختزال والأكسدة',
    subjectId: 'sub_chemistry',
    chapterId: 'ch_c1',
    dueDate: formatD(-1), // Tomorrow
    dueTime: '19:30',
    estimatedMinutes: 50,
    priority: 'medium',
    status: 'todo',
    subtasks: [
      { id: 'st_5', title: 'رسم مخطط السهم للتحويلات', isCompleted: false },
      { id: 'st_6', title: 'حل 10 أسئلة كيف تميز عملياً بين أكسيد حديد 2 و 3', isCompleted: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_4',
    userId: 'usr_student_1',
    title: 'تمارين الاشتقاق الضمني والبارامتري',
    description: 'تمارين 4 في كتاب المعاصر للتفاضل',
    subjectId: 'sub_math',
    chapterId: 'ch_m1',
    dueDate: formatD(-2),
    dueTime: '17:00',
    estimatedMinutes: 75,
    priority: 'high',
    status: 'todo',
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: 'deck_physics_p1',
    userId: 'usr_student_1',
    title: 'قوانين ومفاهيم الكهربية وكيرشوف',
    description: 'أهم التعريفات والقوانين والوحدات المكافئة للتيار الكهربي',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    cardCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deck_arabic_grammar',
    userId: 'usr_student_1',
    title: 'قواعد إعمال المشتقات والبلاغة',
    description: 'شروط عمل اسم الفاعل واسم المفعول وصيغ المبالغة',
    subjectId: 'sub_arabic',
    chapterId: 'ch_a2',
    cardCount: 3,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CARDS: Flashcard[] = [
  {
    id: 'c_p1',
    deckId: 'deck_physics_p1',
    front: 'ما هو نص قانون كيرشوف الأول (قانون حفظ الشحنة)؟',
    back: 'المجموع الجبري للتيارات الكهربية الداخلة عند أي نقطة تفرع في دائرة مغلقة يساوي المجموع الجبري للتيارات الخارجة منها: Σ I_in = Σ I_out',
    hint: 'يرتبط بحفظ الشحنة الكهربية',
    category: 'قانون',
    repetitions: 3,
    intervalDays: 6,
    easeFactor: 2.5,
    nextReviewDate: formatD(0), // due today
    consecutiveSuccesses: 3,
    totalFailures: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c_p2',
    deckId: 'deck_physics_p1',
    front: 'ما هي المقاومة النوعية (ρ) لمادة موصل وما هي وحدة قياسها؟',
    back: 'هي مقاومة موصل من المادة طوله 1 متر ومساحة مقطعه 1 متر مربع عند درجة حرارة معينة. وحدتها: أوم.متر (Ω.m)',
    hint: 'تعتمد فقط على نوع المادة ودرجة الحرارة',
    category: 'تعريف',
    repetitions: 2,
    intervalDays: 3,
    easeFactor: 2.4,
    nextReviewDate: formatD(0),
    consecutiveSuccesses: 2,
    totalFailures: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c_p3',
    deckId: 'deck_physics_p1',
    front: 'علل: لا تتغير المقاومة النوعية لسلك عند زيادة طوله للضعف؟',
    back: 'لأن المقاومة النوعية خاصية فيزيائية مميزة للمادة تعتمد فقط على نوع مادة الموصل ودرجة حرارته ولا تتأثر بالأبعاد الهندسية.',
    hint: 'خاصية فيزيائية مميزة للمادة',
    category: 'تعليل',
    repetitions: 1,
    intervalDays: 1,
    easeFactor: 2.3,
    nextReviewDate: formatD(-1), // due in future
    consecutiveSuccesses: 1,
    totalFailures: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c_a1',
    deckId: 'deck_arabic_grammar',
    front: 'متى يعمل اسم الفاعل المجرد من (أل) عمل فعله؟',
    back: 'بشرطين: 1) أن يدل على الحال أو الاستقبال. 2) أن يعتمد على (مبتدأ، نفي، استفهام، موصوف، نداء، أو يقع حالاً).',
    hint: 'شرطان أساسيان',
    category: 'قاعدة نحوية',
    repetitions: 4,
    intervalDays: 10,
    easeFactor: 2.6,
    nextReviewDate: formatD(0),
    consecutiveSuccesses: 4,
    totalFailures: 0,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SUMMARIES: SummaryRecord[] = [
  {
    id: 'sum_1',
    userId: 'usr_student_1',
    title: 'ملخص شامل: قانونا كيرشوف للدوائر الكهربية',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    originalText: 'قانون كيرشوف الأول يعبر عن حفظ الشحنة الكهربية...',
    summaryText: `### ملخص درس: قانونا كيرشوف للدوائر المعقدة

#### 1. قانون كيرشوف الأول (قانون حفظ الشحنة)
- **النص العلمي:** المجموع الجبري للتيارات الكهربية الداخلة لنقطة تفرع يساوي المجموع الجبري للتيارات الخارجة منها:
  $$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$$
- **الأساس العلمي:** مبني على مبدأ بقاء (حفظ) الشحنة الكهربائية لأن الشحنات لا تفنى ولا تستحدث عند نقاط التفرع.

#### 2. قانون كيرشوف الثاني (قانون حفظ الطاقة)
- **النص العلمي:** في أي مسار مغلق، المجموع الجبري للقوى الدافعة الكهربية للبطاريات يساوي المجموع الجبري لفروق الجهد عبر المقاومات:
  $$\\sum V_B = \\sum (I \\cdot R)$$
- **الأساس العلمي:** مبني على مبدأ حفظ الطاقة في الدوائر المغلقة.

#### 3. خطوات الحل النموذجية في الامتحانات:
1. تحديد اتجاهات التيارات المفترضة عند كل عقدة أو تفرع.
2. تطبيق قانون كيرشوف الأول على نقطة تفرع للحصول على معادلة: $I_1 + I_2 - I_3 = 0$.
3. اختيار مسارين مغلقين وتطبيق قانون كيرشوف الثاني مع مراعاة الإشارات (+ / -).
4. حل المعادلات الثلاث باستخدام الآلة الحاسبة (Equation mode).`,
    type: 'structured',
    difficulty: 'medium',
    tags: ['كهربية', 'كيرشوف', 'فيزياء 3 ثانوي'],
    createdAt: formatD(1),
  },
];

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz_physics_1',
    userId: 'usr_student_1',
    title: 'اختبار تجريبي: كيرشوف والتيار الكهربي',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    createdAt: formatD(2),
    questions: [
      {
        id: 'qp_1',
        type: 'mcq',
        question: 'يعتمد قانون كيرشوف الأول على مبدأ فيزيائي هو:',
        options: ['قانون حفظ الطاقة', 'قانون حفظ الشحنة الكهربية', 'قانون حفظ كمية التحرك', 'قانون نيوتن الثالث'],
        correctAnswer: 'قانون حفظ الشحنة الكهربية',
        explanation: 'ينص قانون كيرشوف الأول على أن الشحنة لا تتراكم عند نقطة التفرع، فالشحنة الداخلة في الثانية تساوي الشحنة الخارجة، وهو تطبيق مباشر لحفظ الشحنة.',
      },
      {
        id: 'qp_2',
        type: 'mcq',
        question: 'إذا زاد طول موصل للضعف ونقصت مساحة مقطعه للنصف، فإن مقاومته الكهربية:',
        options: ['تزداد إلى 4 أمثالها', 'تظل ثابتة', 'تزداد للضعف', 'تقل للربع'],
        correctAnswer: 'تزداد إلى 4 أمثالها',
        explanation: 'بما أن R تتناسب طردياً مع الطول وعكسياً مع المساحة: R_new = (2 / 0.5) * R = 4R.',
      },
      {
        id: 'qp_3',
        type: 'true_false',
        question: 'تعتمد المقاومة النوعية لموصل على أبعاده الهندسية كالطول ونصف القطر.',
        options: ['صواب', 'خطأ'],
        correctAnswer: 'خطأ',
        explanation: 'المقاومة النوعية خاصية فيزيائية مميزة للمادة تعتمد فقط على نوع المادة ودرجة الحرارة، بينما المقاومة الكهربية R هي التي تتأثر بالأبعاد.',
      },
    ],
  },
];

export const DEFAULT_EXAMS: ExamEvent[] = [
  {
    id: 'ex_1',
    userId: 'usr_student_1',
    title: 'امتحان الفيزياء الشهري - الفصلين الأول والثاني',
    subjectId: 'sub_physics',
    examDate: formatD(-12), // 12 days ahead
    examTime: '09:00',
    includedChapters: ['التيار الكهربي وقوانين كيرشوف', 'التأثير المغناطيسي وأجهزة القياس'],
    confidenceLevel: 'medium',
    revisionPlan: 'الأسبوع الأول: حل 5 نماذج شاملة، الأسبوع الثاني: مراجعة مسائل الجلفانومتر والأوميتر وكيرشوف.',
    notes: 'الامتحان 46 سؤال اختيار من متعدد + سؤالين مقالي',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ex_2',
    userId: 'usr_student_1',
    title: 'امتحان التفاضل والتكامل التجريبي',
    subjectId: 'sub_math',
    examDate: formatD(-20), // 20 days ahead
    examTime: '10:00',
    includedChapters: ['اشتقاق الدوال المثلثية', 'معادلات المماس والعمودي والمعدلات الزمنية'],
    confidenceLevel: 'high',
    revisionPlan: 'حل تمارين كتاب المعاصر والمستشار',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_VIDEOS: VideoLesson[] = [
  {
    id: 'vid_1',
    userId: 'usr_student_1',
    title: 'شرح مبسط لقوانين كيرشوف وحل المسائل المعقدة',
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    notes: 'ركز الأستاذ في الدقيقة 12 على إشارة القوة الدافعة الكهربية للبطارية عند السير في اتجاه القطب الموجب.',
    understoodStatus: 'understood',
    storyboard: {
      summary: 'فيديو شرح عملي يوضح كيفية حل أي دائرة كيرشوف في 3 خطوات بسيطة',
      totalDurationMinutes: 4,
      scenes: [
        {
          sceneNumber: 1,
          title: 'المقدمة: لماذا نحتاج قوانين كيرشوف؟',
          durationSeconds: 45,
          visuals: 'مقارنة بين دائرة أوم البسيطة ذات التوالي والتوازي ودائرة معقدة متعددة البطاريات والتفرعات.',
          narration: 'مرحباً يا بطل! إذا واجهت دائرة كهربائية لا تستطيع فيها تمييز التوالي من التوازي، فلا تقلق! هنا يأتي دور العم كيرشوف.',
          keyTakeaway: 'قانون أوم وحده يعجز عن حل الدوائر متعددة البطاريات المغلقة.',
        },
        {
          sceneNumber: 2,
          title: 'القانون الأول: حارس الشحنة عند المفترق',
          durationSeconds: 60,
          visuals: 'رسم متحرك لمفترق طرق مائي أو تيار سيارات يوضح أن كل ما يدخل يجب أن يخرج دون نقصان.',
          narration: 'تخيل نقطة تفرع مثل مفترق طرق. كل قطرة ماء تدخل المفترق ستخرج من إحدى القنوات. كذلك الإلكترونات تماماً!',
          keyTakeaway: 'المجموع الجبري للتيارات الداخلة = الخارجة.',
        },
        {
          sceneNumber: 3,
          title: 'القانون الثاني: رحلة الطاقة في الحلقة المغلقة',
          durationSeconds: 75,
          visuals: 'مسار دائري بسهم متحرك يوضح متى نضع البطارية موجبة ومتى نحسب المقاومة سالبة.',
          narration: 'عندما تدور في مسار مغلق وتخرج من القطب الموجب للبطارية، تكون قد اكتسبت طاقة. وعندما تعبر مقاومة في نفس اتجاه التيار، تكون قد استهلكت جهداً.',
          keyTakeaway: 'مجموع القوى الدافعة = مجموع جهود المقاومات.',
        },
        {
          sceneNumber: 4,
          title: 'تطبيق عملي خطوة بخطوة',
          durationSeconds: 60,
          visuals: 'حل مسألة امتحانات واقعية مع كتابة المعادلات الثلاث وإدخالها على الحاسبة.',
          narration: 'الآن نطبق عملياً: نحدد المسارات، نكتب المعادلات الثلاث، ونحصل على النتيجة بضغطة زر واحدة على الآلة الحاسبة.',
          keyTakeaway: 'الدقة في تحديد الإشارات هي مفتاح العلامة الكاملة.',
        },
      ],
    },
    createdAt: formatD(1),
  },
];

export const DEFAULT_NOTES: StudyNote[] = [
  {
    id: 'not_1',
    userId: 'usr_student_1',
    title: 'فروق هامة: المقاومة الكهربية R والمقاومة النوعية ρ والتوصيلية σ',
    content: `### ملاحظات ذهبية في الفيزياء الكهربية

1. **المقاومة الكهربية (R):**
   - تقاس بالأوم ($\\Omega$)
   - تتوقف على: طول الموصل (L)، مساحة مقطعه (A)، نوع مادته، ودرجة حرارته.
   - إذا سُحب سلك فزاد طوله للضعف: مساحة مقطعه تقل للنصف وتزداد مقاومته إلى 4 أمثالها!

2. **المقاومة النوعية ($\\rho_e$):**
   - تقاس بوحدة ($\\Omega \\cdot m$)
   - خاصية فيزيائية مميزة للمادة؛ لا تتغير بزيادة الطول أو المساحة بل بتغير نوع المادة ودرجة الحرارة فقط!

3. **التوصيلية الكهربية ($\\sigma$):**
   - هي مقلوب المقاومة النوعية: $\\sigma = \\frac{1}{\\rho_e}$
   - تقاس بـ ($\\Omega^{-1} \\cdot m^{-1}$) أو ($S \\cdot m^{-1}$) سيمنز/متر.`,
    subjectId: 'sub_physics',
    chapterId: 'ch_p1',
    tags: ['ملاحظات هامة', 'مقارنات', 'كهربية'],
    isFavorite: true,
    createdAt: formatD(2),
    updatedAt: formatD(2),
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      // Dispatch custom storage event for sync
      window.dispatchEvent(new Event('zakerly_storage_change'));
    } catch (e) {
      console.error(`Error saving key ${key} to localStorage:`, e);
    }
  }

  // Initializer: fills with defaults if empty
  public init(): void {
    if (!localStorage.getItem(STORAGE_PREFIX + 'user')) {
      this.set('user', DEFAULT_USER);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'subjects')) {
      this.set('subjects', DEFAULT_SUBJECTS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'tasks')) {
      this.set('tasks', DEFAULT_TASKS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'sessions')) {
      this.set('sessions', DEFAULT_SESSIONS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'decks')) {
      this.set('decks', DEFAULT_DECKS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'cards')) {
      this.set('cards', DEFAULT_CARDS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'summaries')) {
      this.set('summaries', DEFAULT_SUMMARIES);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'quizzes')) {
      this.set('quizzes', DEFAULT_QUIZZES);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'quiz_attempts')) {
      this.set('quiz_attempts', []);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'videos')) {
      this.set('videos', DEFAULT_VIDEOS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'notes')) {
      this.set('notes', DEFAULT_NOTES);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'exams')) {
      this.set('exams', DEFAULT_EXAMS);
    }
  }

  // User
  public getUser(): UserProfile | null {
    return this.get<UserProfile | null>('user', null);
  }

  public setUser(user: UserProfile | null): void {
    this.set('user', user);
  }

  // Subjects
  public getSubjects(): Subject[] {
    return this.get<Subject[]>('subjects', []);
  }

  public setSubjects(subjects: Subject[]): void {
    this.set('subjects', subjects);
  }

  // Tasks
  public getTasks(): StudyTask[] {
    return this.get<StudyTask[]>('tasks', []);
  }

  public setTasks(tasks: StudyTask[]): void {
    this.set('tasks', tasks);
  }

  // Sessions
  public getSessions(): StudySession[] {
    return this.get<StudySession[]>('sessions', []);
  }

  public setSessions(sessions: StudySession[]): void {
    this.set('sessions', sessions);
  }

  // Decks & Cards
  public getDecks(): FlashcardDeck[] {
    return this.get<FlashcardDeck[]>('decks', []);
  }

  public setDecks(decks: FlashcardDeck[]): void {
    this.set('decks', decks);
  }

  public getCards(): Flashcard[] {
    return this.get<Flashcard[]>('cards', []);
  }

  public setCards(cards: Flashcard[]): void {
    this.set('cards', cards);
  }

  // Summaries
  public getSummaries(): SummaryRecord[] {
    return this.get<SummaryRecord[]>('summaries', []);
  }

  public setSummaries(summaries: SummaryRecord[]): void {
    this.set('summaries', summaries);
  }

  // Quizzes & Attempts
  public getQuizzes(): Quiz[] {
    return this.get<Quiz[]>('quizzes', []);
  }

  public setQuizzes(quizzes: Quiz[]): void {
    this.set('quizzes', quizzes);
  }

  public getQuizAttempts(): QuizAttempt[] {
    return this.get<QuizAttempt[]>('quiz_attempts', []);
  }

  public setQuizAttempts(attempts: QuizAttempt[]): void {
    this.set('quiz_attempts', attempts);
  }

  // Videos
  public getVideos(): VideoLesson[] {
    return this.get<VideoLesson[]>('videos', []);
  }

  public setVideos(videos: VideoLesson[]): void {
    this.set('videos', videos);
  }

  // Notes
  public getNotes(): StudyNote[] {
    return this.get<StudyNote[]>('notes', []);
  }

  public setNotes(notes: StudyNote[]): void {
    this.set('notes', notes);
  }

  // Exams
  public getExams(): ExamEvent[] {
    return this.get<ExamEvent[]>('exams', []);
  }

  public setExams(exams: ExamEvent[]): void {
    this.set('exams', exams);
  }

  // Export all data as JSON
  public exportDataJSON(): string {
    const data: StorageData = {
      user: this.getUser(),
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      sessions: this.getSessions(),
      decks: this.getDecks(),
      cards: this.getCards(),
      summaries: this.getSummaries(),
      quizzes: this.getQuizzes(),
      quizAttempts: this.getQuizAttempts(),
      videos: this.getVideos(),
      notes: this.getNotes(),
      exams: this.getExams(),
      cloudConfig: {
        isConfigured: false,
        lastSynced: new Date().toISOString(),
      },
    };
    return JSON.stringify(data, null, 2);
  }

  // Export Study Sessions as CSV
  public exportSessionsCSV(): string {
    const sessions = this.getSessions();
    const subjects = this.getSubjects();
    const subMap = new Map(subjects.map((s) => [s.id, s.name]));

    const headers = ['التاريخ', 'المادة', 'المدة بالدقائق', 'النوع', 'تقييم التركيز', 'الملاحظات'];
    const rows = sessions.map((s) => [
      `"${s.date}"`,
      `"${subMap.get(s.subjectId) || 'عام'}"`,
      s.durationMinutes,
      `"${s.type}"`,
      s.focusRating || 5,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // Reset to default seed
  public resetToDefault(): void {
    localStorage.clear();
    this.init();
    window.dispatchEvent(new Event('zakerly_storage_change'));
  }
}

export const storage = new StorageService();
