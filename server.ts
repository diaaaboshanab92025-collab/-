import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI with telemetry headers
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check and AI status
app.get('/api/ai/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    configured: hasKey,
    model: 'gemini-3.8-flash',
    message: hasKey ? 'جاهز للاستخدام' : 'مفتاح Gemini API غير متوفر في متغيرات البيئة',
  });
});

// Endpoint: AI Summary Generator
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { content, type = 'structured', difficulty = 'medium', subject = '' } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'المحتوى النصي مطلوب لتوليد التلخيص.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_KEY_MISSING',
        message: 'خدمة الذكاء الاصطناعي تتطلب ضبط GEMINI_API_KEY في إعدادات البيئة.',
      });
    }

    const typeInstructions: Record<string, string> = {
      short: 'لخص الدرس في نقاط مركزة جداً وموجزة لأهم 5 إلى 7 أفكار رئيسية.',
      detailed: 'قدم تلخيصاً شاملاً ومفصلاً يغطي كافة جوانب الدرس وتفاصيله والشروحات اللازمة.',
      structured: 'نظم التلخيص بعناوين رئيسية، عناوين فرعية، نقاط مدعومة، مصطلحات بارزة، وخلاصة ختامية.',
      key_concepts: 'استخرج فقط المفاهيم الأساسية والتعريفات الدقيقة والقوانين والمعادلات والتواريخ الهامة.',
      exam_questions: 'استخرج أهم الأسئلة المتوقعة في الامتحانات مع إجاباتها النموذجية الموجزة.',
    };

    const prompt = `
أنت معلم وخبير تربوي متميز في منصة "ذاكرلي | Zakerly".
المهمة: قم بإعداد تلخيص تعليمي دقيق وموثوق استناداً إلى النص المقدم حصراً.
المادة: ${subject || 'عام'}
المستوى / الصعوبة: ${difficulty}
نوع التلخيص المطلوب: ${typeInstructions[type] || typeInstructions.structured}

القواعد الصارمة:
1. اعتمد بشكل أساسي ومباشر على المادة المرفقة من الطالب.
2. لا تختلق حقائق أو قوانين أو تواريخ من خارج النص إذا لم تكن موجودة.
3. إذا وجد غموض في النص، نبه الطالب بلطف.
4. حافظ على المصطلحات العلمية والمعادلات الرياضية بصيغتها الدقيقة.
5. اكتب بلغة عربية تعليمية واضحة ومشكولة في المصطلحات الحساسة.
6. قدم التلخيص بتنسيق Markdown أنيق ومرتب وسهل القراءة.

النص المراد تلخيصه:
"""
${content.slice(0, 25000)}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      summary: response.text || 'تعذر استخراج تلخيص واضح من النص المقدم.',
      type,
      subject,
    });
  } catch (err: any) {
    console.error('Summary error:', err);
    return res.status(500).json({
      error: 'AI_GENERATION_FAILED',
      message: err.message || 'حدث خطأ أثناء معالجة طلب التلخيص.',
    });
  }
});

// Endpoint: AI Tutor & Explanation
app.post('/api/ai/tutor', async (req, res) => {
  try {
    const {
      question,
      context = '',
      style = 'simple',
      grade = '',
      subject = '',
      history = [],
    } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'السؤال مطلوب لمحادثة المعلم الذكي.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_KEY_MISSING',
        message: 'خدمة المعلم الذكي تتطلب ضبط GEMINI_API_KEY.',
      });
    }

    const styleGuide: Record<string, string> = {
      simple: 'أسلوب تبسيطي سلس للغاية، أمثلة من واقع الحياة اليومية، وتجنب التعقيد اللفظي.',
      detailed: 'شرح أكاديمي دقيق ومفصل مع العمق العلمي والتحليل المنطقي.',
      examples: 'التركيز على إعطاء مسائل وأمثلة تطبيقية محلولة خطوة بخطوة مع التعليل.',
      exam_focused: 'التركيز على كيفية ورود هذا المفهوم في ورقة الامتحان، الفخاخ الشائعة، ونموذج الإجابة المعتمد.',
      socratic: 'علمني بالأسئلة: لا تعطه الإجابة المباشرة فورا، بل قده خطوة بخطوة بسؤال تحفيزي وتلميح ذكي لاكتشاف الحل.',
    };

    const systemInstruction = `
أنت "المعلم الذكي" الشخصي في تطبيق "ذاكرلي | Zakerly".
أنت صديق دراسي صبور، مشجع، وأكاديمي خبير.
المادة: ${subject || 'غير محددة'}
المرحلة الدراسية: ${grade || 'مرحلة مدرسية'}
أسلوب الشرح المطلوب: ${styleGuide[style] || styleGuide.simple}

إرشادات العمل:
1. أجب بلغة عربية سليمة وودودة تناسب سن الطالب.
2. نسق الإجابة باستخدام Markdown، واستخدم الرموز التعبيرية بحذر للتشجيع والترتيب.
3. فرّق دائماً بين المعلومات المؤكدة من سياق درس الطالب والشروحات الإضافية.
4. للمسائل الرياضية أو العلمية: اذكر القانون أولاً، ثم التعويض بالأرقام، ثم الناتج النهائي مع وحدات القياس.
5. في نهاية الإجابة، اعرض خطوة تالية اختيارية (مثل: هل تريد مثالاً إضافياً، أو سؤالاً لاختبار فهمك؟).
`;

    // Build conversation context
    let promptText = '';
    if (context) {
      promptText += `سياق الدرس أو المادة الحالية:\n"""\n${context.slice(0, 8000)}\n"""\n\n`;
    }

    if (Array.isArray(history) && history.length > 0) {
      promptText += 'سجل الحوار السابق:\n';
      for (const msg of history.slice(-6)) {
        promptText += `${msg.role === 'user' ? 'الطالب' : 'المعلم'}: ${msg.content}\n`;
      }
      promptText += '\n';
    }

    promptText += `سؤال الطالب الآن: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      answer: response.text || 'عذراً، لم أستطع الإجابة حالياً. يرجى إعادة صياغة السؤال.',
    });
  } catch (err: any) {
    console.error('Tutor error:', err);
    return res.status(500).json({
      error: 'AI_TUTOR_FAILED',
      message: err.message || 'حدث خطأ في محادثة المعلم الذكي.',
    });
  }
});

// Endpoint: AI Quiz Generator
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const {
      content,
      questionCount = 5,
      type = 'mixed', // 'mcq' | 'true_false' | 'short_answer' | 'mixed'
      difficulty = 'medium',
      subject = '',
      chapter = '',
    } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'المحتوى الدراسي مطلوب لإنشاء الاختبار.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_KEY_MISSING',
        message: 'خدمة الاختبارات تتطلب ضبط GEMINI_API_KEY.',
      });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 2), 15);

    const prompt = `
أنت خبير قياس وتقويم تربوي لمنصة "ذاكرلي".
المهمة: قم بتوليد اختبار تفاعلي دقيق مكون من ${count} أسئلة استناداً إلى النص التعليمي التالي.
المادة: ${subject || 'عام'}
الفصل: ${chapter || 'عام'}
مستوى الصعوبة: ${difficulty} (سهل / متوسط / صعب)
نوع الأسئلة: ${type} (خيارات متعددة mcq، صح أو خطأ true_false، أسئلة قصيرة short_answer، أو منوع mixed).

يجب أن تكون الاستجابة حصراً بصيغة JSON صالحة وفق المخطط التالي:
{
  "title": "عنوان وصفي للاختبار",
  "questions": [
    {
      "id": "q1",
      "type": "mcq", // "mcq" | "true_false" | "short_answer"
      "question": "نص السؤال بوضوح تام",
      "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"], // مصفوفة الخيارات (إذا كان true_false اجعلها ["صواب", "خطأ"])
      "correctAnswer": "النص المطابق تماماً للخيار الصحيح",
      "explanation": "تعليل تفصيلي مبسط يشرح سبب صحة هذا الجواب ولماذا الخيارات الأخرى خاطئة"
    }
  ]
}

النص التعليمي المرجعي:
"""
${content.slice(0, 15000)}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Quiz error:', err);
    return res.status(500).json({
      error: 'AI_QUIZ_FAILED',
      message: err.message || 'حدث خطأ في توليد الاختبار.',
    });
  }
});

// Endpoint: AI Flashcards Generator
app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { content, cardCount = 8, subject = '', chapter = '' } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'المحتوى النصي مطلوب لتوليد البطاقات.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_KEY_MISSING',
        message: 'خدمة توليد البطاقات تتطلب ضبط GEMINI_API_KEY.',
      });
    }

    const count = Math.min(Math.max(Number(cardCount) || 8, 3), 20);

    const prompt = `
أنت خبير في تقنيات الاسترجاع النشط والتكرار المتباعد (Spaced Repetition / Anki) لمنصة "ذاكرلي".
المهمة: استخرج عدد ${count} بطاقات استذكار ذكية (Flashcards) عالية الجودة من النص المرفق.
المادة: ${subject}
الفصل: ${chapter}

قواعد بطاقات الاستذكار الفعالة:
1. مبدأ الذرة (Atomic Principle): كل بطاقة تختبر معلومة أو مفهوماً أو قانوناً واحداً فقط.
2. السؤال في الوجه الأمامي (Front): سؤال مباشر، تعريف مصطلح، أو إكمال فراغ حاسم.
3. الإجابة في الوجه الخلفي (Back): إجابة موجزة، دقيقة، وواضحة جداً مع شرح إضافي قصير جداً إن لزم.
4. التصنيف (category): تعريف، قانون، تاريخ، مفهوم، مقارنة.

أخرج النتيجة بصيغة JSON فقط:
{
  "deckTitle": "عنوان حزمة البطاقات",
  "cards": [
    {
      "front": "السؤال أو المصطلح",
      "back": "الجواب الدقيق أو التعريف",
      "hint": "تلميح ذكي اختياري يساعد على التذكر",
      "category": "مفهوم"
    }
  ]
}

النص:
"""
${content.slice(0, 15000)}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Flashcards error:', err);
    return res.status(500).json({
      error: 'AI_FLASHCARDS_FAILED',
      message: err.message || 'حدث خطأ في توليد البطاقات التعليمية.',
    });
  }
});

// Endpoint: AI Video Explanation Script & Storyboard
app.post('/api/ai/video-script', async (req, res) => {
  try {
    const { topic, content = '', targetMinutes = 3, subject = '', grade = '' } = req.body;
    if (!topic && !content) {
      return res.status(400).json({ error: 'يرجى تقديم عنوان الدرس أو محتواه النصي.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_KEY_MISSING',
        message: 'خدمة سيناريو الشرح تتطلب ضبط GEMINI_API_KEY.',
      });
    }

    const prompt = `
أنت مخرج ومصمم محتوى تعليمي مرئي في منصة "ذاكرلي".
المهمة: كتابة سيناريو فيديو تعليمي ولوحة قصة (Storyboard) تفاعلية ومبسطة للدرس: "${topic || 'شرح الدرس'}".
المادة: ${subject || 'عام'}
المرحلة: ${grade || 'مدرسي'}
المدة التقديرية: حوالي ${targetMinutes} دقائق.

قم بتقسيم الفيديو إلى مشاهد متسلسلة (Scenes). لكل مشهد حدد:
- عنوان المشهد
- المدة التقديرية بالثواني
- ما يظهر على الشاشة (On-Screen Visuals / Diagrams / Animations)
- النص الصوتي المقروء للمعلّم (Voiceover Narration)
- فكرة رئيسية مستفادة (Key Takeaway)

أخرج النتيجة بصيغة JSON فقط:
{
  "title": "عنوان الفيديو التعليمي",
  "totalDurationMinutes": ${targetMinutes},
  "summary": "نظرة عامة على محتوى الفيديو",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "مقدمة الدرس والتشويق",
      "durationSeconds": 30,
      "visuals": "رسم توضيحي يظهر كذا مع حركة سهم يوضح...",
      "narration": "مرحباً بكم يا أبطال، اليوم سنكتشف معاً سر...",
      "keyTakeaway": "فهم المشكلة الأساسية"
    }
  ]
}

محتوى الدرس أو الملاحظات المرفقة:
"""
${(content || topic).slice(0, 12000)}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Video script error:', err);
    return res.status(500).json({
      error: 'AI_SCRIPT_FAILED',
      message: err.message || 'حدث خطأ في إنشاء سيناريو الدرس التعليمي.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zakerly Server] Running at http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
