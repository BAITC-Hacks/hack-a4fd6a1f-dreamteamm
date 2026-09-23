'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { 
  TaskCategory, 
  TaskPriority, 
  ClarifyingQuestion, 
  ReadinessScoreResult 
} from '@/lib/types';
import ReadinessScoreWidget from '@/components/ReadinessScoreWidget';
import { 
  Sparkles, 
  Wand2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle,
  Save, 
  Eye,
  Send,
  Layers,
  Check
} from 'lucide-react';

const CATEGORIES: TaskCategory[] = ['Engineering', 'Data', 'Design', 'Business', 'CleanTech', 'FinTech'];

interface AiTaskConstructorProps {
  onSuccess?: () => void;
}

export default function AiTaskConstructor({ onSuccess }: AiTaskConstructorProps) {
  const router = useRouter();
  const { user, token } = useRole();

  // Wizard Steps: 1 = Draft, 2 = AI Questions, 3 = Review & Edit, 4 = Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Initial Draft
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Engineering');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [initialDraft, setInitialDraft] = useState('');
  const [tags, setTags] = useState('');

  // Step 2: AI Clarification
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [initialEstimatedScore, setInitialEstimatedScore] = useState<number>(25);

  // Step 3: Synthesized Card & 8 Fields
  const [synthesizing, setSynthesizing] = useState(false);
  const [contextNeed, setContextNeed] = useState('');
  const [dataMaterials, setDataMaterials] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [constraints, setConstraints] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [businessContact, setBusinessContact] = useState('');
  
  const [currentReadiness, setCurrentReadiness] = useState<ReadinessScoreResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedTaskId, setPublishedTaskId] = useState<number | null>(null);

  // 1. Analyze Draft with AI and Get 3+ Questions
  const handleAnalyzeDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialDraft.trim()) return;

    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: initialDraft, category })
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
        setInitialEstimatedScore(data.estimatedScore || 30);
        // Pre-fill answer keys
        const initialAnswers: Record<string, string> = {};
        (data.questions || []).forEach((q: ClarifyingQuestion) => {
          initialAnswers[q.targetField] = '';
        });
        setAnswers(initialAnswers);
        setStep(2);
      }
    } catch (err) {
      console.error('Error analyzing draft:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // 2. Synthesize Card from Draft + Q&A Answers
  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      const res = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          category,
          initialDraft,
          answers,
          owner: user?.organization || user?.name || 'Бизнес-партнер'
        })
      });
      const data = await res.json();
      if (res.ok) {
        const c = data.card;
        setContextNeed(c.context_need);
        setDataMaterials(c.data_materials);
        setExpectedResult(c.expected_result);
        setSuccessCriteria(c.success_criteria);
        setConstraints(c.constraints);
        setTargetUsers(c.target_users);
        setBusinessContact(c.business_contact);
        setCurrentReadiness(data.readiness);
        setStep(3);
      }
    } catch (err) {
      console.error('Error synthesizing card:', err);
    } finally {
      setSynthesizing(false);
    }
  };

  // 3. Confirm and Publish Task to Catalog
  const handlePublish = async (finalStatus: 'Published' | 'Draft' = 'Published') => {
    setPublishing(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: title || 'Новая бизнес-задача',
          category,
          priority,
          status: finalStatus,
          tags: tags || `${category}, MVP, Студенческий проект`,
          owner: user?.organization || user?.name || 'Бизнес-партнер',
          context_need: contextNeed,
          data_materials: dataMaterials,
          expected_result: expectedResult,
          success_criteria: successCriteria,
          constraints,
          target_users: targetUsers,
          business_contact: businessContact
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPublishedTaskId(data.task.id);
        setStep(4);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Error publishing task:', err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Wizard Header with 4 Steps Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
                <span>AI-Конструктор карточки задачи</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Sana Pipeline
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Сквозной сценарий: от краткого черновика до подтвержденной публикации с высоким рейтингом
              </p>
            </div>
          </div>

          <div className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/10 text-indigo-200 font-medium">
            Шаг {step} из 4
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`p-2 rounded-xl border text-center transition-all ${
            step >= 1 ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="hidden sm:inline">1. </span>Черновик
          </div>

          <div className={`p-2 rounded-xl border text-center transition-all ${
            step >= 2 ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="hidden sm:inline">2. </span>AI-Уточнение
          </div>

          <div className={`p-2 rounded-xl border text-center transition-all ${
            step >= 3 ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="hidden sm:inline">3. </span>Карточка & Рейтинг
          </div>

          <div className={`p-2 rounded-xl border text-center transition-all ${
            step === 4 ? 'bg-emerald-600/40 border-emerald-400 text-emerald-200 font-bold' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="hidden sm:inline">4. </span>Публикация
          </div>
        </div>
      </div>

      {/* STEP 1: Initial Draft */}
      {step === 1 && (
        <form onSubmit={handleAnalyzeDraft} className="p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Шаг 1: Опишите вашу бизнес-потребность в свободной форме
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Достаточно пары предложений. Искусственный интеллект проанализирует полноту и задаст недостающие вопросы.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Рабочее название задачи <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Модель прогнозирования оттока клиентов"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Отрасль / Категория <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Краткое первоначальное описание проблемы <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={initialDraft}
              onChange={(e) => setInitialDraft(e.target.value)}
              placeholder="Например: У нас интернет-магазин, и мы хотим делать персональные рекомендации товаров для покупателей, чтобы повысить средний чек. Сейчас у нас просто список популярных товаров."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI определит недостающие данные и сформирует не менее 3 вопросов
            </span>

            <button
              type="submit"
              disabled={analyzing || !initialDraft.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <span>{analyzing ? 'AI анализирует пробелы...' : 'Проанализировать с помощью AI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: AI Clarification Questions */}
      {step === 2 && (
        <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-sm">
                {initialEstimatedScore}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">
                  Текущий ориентировочный рейтинг черновика: {initialEstimatedScore} из 100 (Черновик)
                </h4>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Ответьте на уточняющие вопросы AI ниже, чтобы повысить рейтинг карточки до 90+ («Приоритетная») и вывести задачу в топ каталога!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Уточняющие вопросы от AI ({questions.length} вопроса):</span>
            </h3>

            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-900">
                    {idx + 1}. {q.question}
                  </label>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    +{q.targetField === 'data_materials' ? '20 баллов' : q.targetField === 'expected_result' ? '15 баллов' : '15 баллов'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  💡 {q.whyNeeded}
                </p>

                <textarea
                  rows={2}
                  value={answers[q.targetField] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.targetField]: e.target.value })}
                  placeholder={q.placeholder}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к черновику</span>
            </button>

            <button
              type="button"
              onClick={handleSynthesize}
              disabled={synthesizing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <span>{synthesizing ? 'AI синтезирует карточку...' : 'Сформировать карточку задачи'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: Review & Manual Confirmation */}
      {step === 3 && (
        <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Шаг 3: Проверьте и подтвердите сформированную карточку
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ИИ структурировал ваши ответы по 7 ключевым блокам. Вы можете вручную отредактировать любое поле перед публикацией.
            </p>
          </div>

          {/* Quality Rating Widget */}
          {currentReadiness && (
            <ReadinessScoreWidget
              score={currentReadiness.score}
              readiness={currentReadiness}
              showDetailsDefault={true}
            />
          )}

          {/* 7 Editable Hackathon Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Context & Need */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  1. Контекст и потребность бизнеса
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">20 баллов</span>
              </div>
              <textarea
                rows={3}
                value={contextNeed}
                onChange={(e) => setContextNeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 2. Data & Materials */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  2. Доступные данные и материалы
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">20 баллов</span>
              </div>
              <textarea
                rows={3}
                value={dataMaterials}
                onChange={(e) => setDataMaterials(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 3. Expected Result */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  3. Ожидаемый результат (артефакт)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">15 баллов</span>
              </div>
              <textarea
                rows={3}
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 4. Success Criteria */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  4. Измеримые критерии успеха
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">15 баллов</span>
              </div>
              <textarea
                rows={3}
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 5. Constraints */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  5. Ограничения и стек технологий
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">10 баллов</span>
              </div>
              <textarea
                rows={3}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 6. Target Users */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  6. Целевые пользователи решения
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">10 баллов</span>
              </div>
              <textarea
                rows={3}
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* 7. Business Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  7. Связь с бизнесом и обратная связь
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">10 баллов</span>
              </div>
              <textarea
                rows={3}
                value={businessContact}
                onChange={(e) => setBusinessContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
              />
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться к вопросам</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePublish('Draft')}
                disabled={publishing}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Сохранить как черновик
              </button>

              <button
                type="button"
                onClick={() => handlePublish('Published')}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>Подтвердить и опубликовать в каталоге</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* STEP 4: Success & Published */}
      {step === 4 && (
        <div className="p-8 sm:p-12 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Задача успешно опубликована в каталоге!
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Благодаря заполнению ключевых разделов карточка получила высокий рейтинг готовности и заняла приоритетную позицию в каталоге для студенческих команд.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {publishedTaskId && (
              <button
                type="button"
                onClick={() => router.push(`/tasks/${publishedTaskId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Открыть карточку задачи</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push('/catalog')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold"
            >
              <span>Перейти в общий каталог</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setTitle('');
                setInitialDraft('');
                setAnswers({});
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-2"
            >
              + Создать еще одну задачу
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
