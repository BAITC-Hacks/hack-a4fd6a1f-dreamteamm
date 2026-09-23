'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Task, TaskCategory, TaskPriority, TaskStatus, FieldError } from '@/lib/types';
import { calculateReadinessScore } from '@/lib/readiness';
import ReadinessScoreWidget from '@/components/ReadinessScoreWidget';
import AiTaskConstructor from '@/components/AiTaskConstructor';
import EmptyState from '@/components/EmptyState';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Wand2,
  Layers,
  ArrowRight
} from 'lucide-react';

const CATEGORIES: TaskCategory[] = ['Engineering', 'Data', 'Design', 'Business', 'CleanTech', 'FinTech'];
const STATUSES: TaskStatus[] = ['Draft', 'Needs Info', 'Published', 'In Progress', 'Closed'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

function AdminStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, role, token } = useRole();

  const [activeTab, setActiveTab] = useState<'ai_wizard' | 'manual_editor'>('ai_wizard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Manual Editing Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Engineering');
  const [owner, setOwner] = useState(user?.organization || user?.name || 'Бизнес-партнер');
  const [status, setStatus] = useState<TaskStatus>('Published');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [tags, setTags] = useState('');

  // 7 Hackathon Fields
  const [contextNeed, setContextNeed] = useState('');
  const [dataMaterials, setDataMaterials] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [constraints, setConstraints] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [businessContact, setBusinessContact] = useState('');

  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldError[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (editId && tasks.length > 0) {
      const target = tasks.find(t => t.id === parseInt(editId, 10));
      if (target) {
        populateForm(target);
      }
    }
  }, [editId, tasks]);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch('/api/tasks?size=100');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching admin tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const populateForm = (task: Task) => {
    setActiveTab('manual_editor');
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category);
    setOwner(task.owner);
    setStatus(task.status);
    setPriority(task.priority);
    setTags(task.tags || '');
    setContextNeed(task.context_need || task.notes);
    setDataMaterials(task.data_materials || '');
    setExpectedResult(task.expected_result || '');
    setSuccessCriteria(task.success_criteria || '');
    setConstraints(task.constraints || '');
    setTargetUsers(task.target_users || '');
    setBusinessContact(task.business_contact || '');
    setFormErrors([]);
    setSaveSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTaskId(null);
    setTitle('');
    setCategory('Engineering');
    setOwner(user?.organization || user?.name || 'Бизнес-партнер');
    setStatus('Published');
    setPriority('Medium');
    setTags('');
    setContextNeed('');
    setDataMaterials('');
    setExpectedResult('');
    setSuccessCriteria('');
    setConstraints('');
    setTargetUsers('');
    setBusinessContact('');
    setFormErrors([]);
    setSaveSuccess(null);
  };

  // Real-time readiness evaluation
  const liveReadiness = calculateReadinessScore({
    title,
    context_need: contextNeed,
    data_materials: dataMaterials,
    expected_result: expectedResult,
    success_criteria: successCriteria,
    constraints,
    target_users: targetUsers,
    business_contact: businessContact
  });

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);
    setSaveSuccess(null);

    try {
      const payload = {
        title,
        category,
        owner,
        status,
        priority,
        tags,
        context_need: contextNeed,
        data_materials: dataMaterials,
        expected_result: expectedResult,
        success_criteria: successCriteria,
        constraints,
        target_users: targetUsers,
        business_contact: businessContact
      };

      const url = isEditing ? `/api/tasks/${currentTaskId}` : '/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setFormErrors(data.errors);
        else setFormErrors([{ field: 'form', message: data.message || 'Ошибка сохранения' }]);
        return;
      }

      setSaveSuccess(isEditing ? 'Карточка успешно обновлена!' : 'Новая карточка успешно опубликована!');
      fetchTasks();
      if (!isEditing) resetForm();
    } catch (err: any) {
      setFormErrors([{ field: 'server', message: err.message || 'Ошибка сервера' }]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm(`Удалить задачу #${id} и связанные предложения?`)) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (currentTaskId === id) resetForm();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChangeQuick = async (id: number, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Error quick updating status:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Мастер бизнес-задач</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {role === 'business' ? 'Кабинет бизнеса' : 'Панель администратора'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Превратите первоначальное краткое описание в полноценную карточку с AI-уточнением и максимальным рейтингом.
          </p>
        </div>

        {/* Tab Switcher: AI Wizard vs Manual Editor */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ai_wizard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'ai_wizard'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI-Конструктор (4 шага)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manual_editor');
              if (!isEditing) resetForm();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'manual_editor'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Редактирование' : 'Ручной ввод'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: AI Task Wizard (Recommended 4-Step Hackathon Workflow) */}
      {activeTab === 'ai_wizard' && (
        <AiTaskConstructor onSuccess={fetchTasks} />
      )}

      {/* Mode 2: Manual 7-Section Card Studio with Live Readiness Breakdown */}
      {activeTab === 'manual_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isEditing ? `Редактирование карточки #${currentTaskId}` : 'Ручное заполнение 7 блоков паспорта'}
                </h2>
                <p className="text-xs text-slate-500">Баллы начисляются только за заполненные поля</p>
              </div>
              {isEditing && (
                <button onClick={resetForm} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Сбросить и создать новую
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Название задачи <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Разработка рекомендательного сервиса"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Отрасль</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Приоритет</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Статус</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* 7 Fields with Weights */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Контекст и потребность (20 баллов) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={contextNeed}
                  onChange={(e) => setContextNeed(e.target.value)}
                  placeholder="Что происходит сейчас и что требуется изменить..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Доступные данные и материалы (20 баллов)
                </label>
                <textarea
                  rows={2}
                  value={dataMaterials}
                  onChange={(e) => setDataMaterials(e.target.value)}
                  placeholder="Исходные данные, API, схемы, примеры..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Ожидаемый результат (15 баллов)
                  </label>
                  <textarea
                    rows={2}
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    placeholder="Конкретный артефакт сдачи..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4. Критерии успеха (15 баллов)
                  </label>
                  <textarea
                    rows={2}
                    value={successCriteria}
                    onChange={(e) => setSuccessCriteria(e.target.value)}
                    placeholder="Измеримые признаки приемки..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    5. Ограничения (10 б.)
                  </label>
                  <input
                    type="text"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="Сроки, стек..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6. Пользователи (10 б.)
                  </label>
                  <input
                    type="text"
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    placeholder="Для кого..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    7. Контакт бизнеса (10 б.)
                  </label>
                  <input
                    type="text"
                    value={businessContact}
                    onChange={(e) => setBusinessContact(e.target.value)}
                    placeholder="Email, Telegram..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Теги</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Python, React, ML..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Сохранение...' : isEditing ? 'Обновить карточку' : 'Сохранить и опубликовать'}</span>
              </button>

            </form>
          </div>

          {/* Live Readiness Sidebar */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Живой расчет рейтинга по формуле AI Sana</span>
            </div>

            <ReadinessScoreWidget
              score={liveReadiness.score}
              readiness={liveReadiness}
              showDetailsDefault={true}
            />
          </div>

        </div>
      )}

      {/* Moderation / Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Все задачи в реестре ({tasks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Ранжируются по рейтингу готовности. Вы можете редактировать карточки или просматривать поступившие отклики.
            </p>
          </div>
        </div>

        {loadingTasks ? (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            type="tasks"
            title="Нет записей"
            description="Создайте первую задачу через AI-конструктор выше."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Задача</th>
                  <th className="py-3 px-3">Отрасль</th>
                  <th className="py-3 px-3">Статус</th>
                  <th className="py-3 px-3 text-center">Рейтинг</th>
                  <th className="py-3 px-3 text-center">Уровень</th>
                  <th className="py-3 px-3 text-center">Отклики</th>
                  <th className="py-3 px-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">#{t.id}</td>
                    
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{t.title}</div>
                      <div className="text-[11px] text-slate-600 truncate max-w-xs">{t.owner}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{t.category}</span>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={t.status}
                        onChange={(e: any) => handleStatusChangeQuick(t.id, e.target.value)}
                        className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold focus:outline-none"
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center font-extrabold text-sm">
                      <span className={
                        t.readiness_score >= 90 ? 'text-purple-700' :
                        t.readiness_score >= 70 ? 'text-emerald-700' :
                        t.readiness_score >= 40 ? 'text-amber-700' : 'text-rose-700'
                      }>
                        {t.readiness_score} б.
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        t.readiness_tier === 'priority' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        t.readiness_tier === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                        t.readiness_tier === 'working' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {t.readiness_tier}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-indigo-600">
                      {t.proposals_count || 0}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => populateForm(t)}
                          title="Редактировать"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => router.push(`/tasks/${t.id}`)}
                          title="Открыть карточку"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          title="Удалить"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default function AdminPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500 animate-pulse">
        <p className="text-sm font-semibold">Загрузка Мастера задач...</p>
      </div>
    }>
      <AdminStudioContent />
    </React.Suspense>
  );
}
