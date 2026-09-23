'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Task, Proposal, ReadinessScoreResult, FieldError, ProposalStatus } from '@/lib/types';
import ReadinessScoreWidget from '@/components/ReadinessScoreWidget';
import EmptyState from '@/components/EmptyState';
import { CATEGORY_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '@/components/TaskCard';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Paperclip, 
  Send, 
  Users, 
  CheckCircle2, 
  Award, 
  Upload,
  AlertCircle,
  Download,
  ExternalLink,
  Flame,
  Check,
  X
} from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { user, role, token } = useRole();

  const [task, setTask] = useState<Task | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScoreResult | undefined>(undefined);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal Submission Form state (for Students)
  const [teamName, setTeamName] = useState(user?.team_name || '');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentContact, setStudentContact] = useState(user?.email || '');
  const [solutionIdea, setSolutionIdea] = useState('');
  const [plan, setPlan] = useState('');
  const [timeline, setTimeline] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalErrors, setProposalErrors] = useState<FieldError[]>([]);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

  const [updatingProposalId, setUpdatingProposalId] = useState<number | null>(null);
  const [awardNotification, setAwardNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    if (user) {
      if (user.team_name && !teamName) setTeamName(user.team_name);
      if (user.name && !studentName) setStudentName(user.name);
      if (user.email && !studentContact) setStudentContact(user.email);
    }
  }, [user]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Задача не найдена');
        throw new Error(`Ошибка загрузки ${res.status}`);
      }
      const data = await res.json();
      setTask(data.task);
      setReadiness(data.readiness);

      // Fetch proposals for task
      const propRes = await fetch(`/api/tasks/${taskId}/proposals`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProposals(propData.proposals || []);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки карточки задачи');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProposal(true);
    setProposalErrors([]);
    setProposalSuccess(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}/proposals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          team_name: teamName,
          student_name: studentName,
          student_contact: studentContact,
          solution_idea: solutionIdea,
          plan,
          timeline,
          prototype_url: prototypeUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setProposalErrors(data.errors);
        } else {
          setProposalErrors([{ field: 'form', message: data.message || 'Ошибка при отправке предложения' }]);
        }
        return;
      }

      setProposalSuccess('Предложение успешно отправлено бизнесу! Вы получите уведомление при решении заказчика.');
      setSolutionIdea('');
      setPlan('');
      setTimeline('');
      setPrototypeUrl('');
      fetchTaskDetails();
    } catch (err: any) {
      setProposalErrors([{ field: 'server', message: err.message || 'Ошибка сети' }]);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSelectTeam = async (proposalId: number, status: ProposalStatus) => {
    setUpdatingProposalId(proposalId);
    setAwardNotification(null);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
        if (status === 'Selected') {
          setAwardNotification('🎉 Команда официально выбрана! Ей начислено +100 баллов прогресса (XP).');
          setTimeout(() => setAwardNotification(null), 6000);
        }
      }
    } catch (err) {
      console.error('Error updating proposal status:', err);
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const getFieldError = (field: string) => {
    return proposalErrors.find(e => e.field === field)?.message;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-28" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-32 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <EmptyState
          type="error"
          title="Задача недоступна"
          description={error || 'Карточка задачи не найдена.'}
          actionText="Вернуться в каталог"
          onAction={() => router.push('/catalog')}
        />
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Engineering;
  const statColor = STATUS_COLORS[task.status] || STATUS_COLORS.Draft;
  const priColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;
  const tags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в каталог задач</span>
        </Link>

        {(role === 'business' || role === 'admin') && (
          <Link
            href={`/admin?edit=${task.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Редактировать карточку
          </Link>
        )}
      </div>

      {/* Main Task Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
            {task.category}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${statColor.bg} ${statColor.text} ${statColor.border}`}>
            {task.status}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${priColor.dot}`} />
            {task.priority} приоритет
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>Обновлено: {task.last_updated}</span>
          </span>
        </div>

        {/* Task Title */}
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {task.title}
        </h1>

        {/* Organization / Owner Details */}
        <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-slate-600">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-900">{task.owner}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {tags.map((tag, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Hackathon Readiness Score Widget */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-purple-600" />
          <span>Рейтинг готовности задачи по шкале AI Sana (0–100 баллов)</span>
        </h3>
        <ReadinessScoreWidget
          score={task.readiness_score}
          readiness={readiness}
          showDetailsDefault={true}
        />
      </div>

      {/* 7 Structured Hackathon Modules */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
          Паспорт бизнес-задачи
        </h3>

        <div className="space-y-5 text-xs sm:text-sm">
          
          {/* 1. Context & Need */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-900 font-bold">
              <span>1. Контекст и потребность</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">20 баллов</span>
            </div>
            <p className="text-slate-700 leading-relaxed pt-1 whitespace-pre-line">
              {task.context_need || task.notes}
            </p>
          </div>

          {/* 2. Data & Materials */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-900 font-bold">
              <span>2. Доступные данные и материалы</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">20 баллов</span>
            </div>
            <p className="text-slate-700 leading-relaxed pt-1 whitespace-pre-line">
              {task.data_materials || 'Информация уточняется заказчиком.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3. Expected Result */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>3. Ожидаемый результат</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">15 баллов</span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 whitespace-pre-line">
                {task.expected_result || 'Согласованный рабочий прототип.'}
              </p>
            </div>

            {/* 4. Success Criteria */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>4. Критерии успеха</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">15 баллов</span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 whitespace-pre-line">
                {task.success_criteria || 'Выполнение требований технического задания.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 5. Constraints */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>5. Ограничения</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">10 баллов</span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 text-xs">
                {task.constraints || 'Сроки и стек согласовываются.'}
              </p>
            </div>

            {/* 6. Target Users */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>6. Пользователи</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">10 баллов</span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 text-xs">
                {task.target_users || 'Клиенты и сотрудники компании.'}
              </p>
            </div>

            {/* 7. Business Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>7. Связь с бизнесом</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">10 баллов</span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 text-xs">
                {task.business_contact || task.owner}
              </p>
            </div>
          </div>

        </div>

        {/* Attachment Card if present */}
        {task.attachment_key && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-indigo-600" />
              Прикрепленные материалы к задаче
            </h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {task.attachment_name || task.attachment_key}
                  </p>
                  <p className="text-[10px] text-slate-500">Официальный бриф / ТЗ задачи</p>
                </div>
              </div>
              <a
                href={`/api/attachments/${task.attachment_key}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT ROLE: Proposal Submission Form (Step 6) */}
      {role === 'student' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Подать предложение от студенческой команды
              </h3>
              <p className="text-xs text-slate-500">
                Любая команда может отправить идею решения, план и ссылку на прототип. Число откликов не ограничивается.
              </p>
            </div>
          </div>

          {proposalSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Предложение отправлено!</p>
                <p className="text-xs mt-0.5">{proposalSuccess}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleProposalSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Название команды <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CyberAlphas Team"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Капитан / ФИО представителя <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Дана Исаева"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Контакт (Telegram или Email) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="e.g. @dana_ml или dana@cs.edu"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Solution Idea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Идея и подход к решению <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={solutionIdea}
                onChange={(e) => setSolutionIdea(e.target.value)}
                placeholder="Опишите предлагаемую архитектуру, технологии и ключевые гипотезы..."
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm focus:outline-none ${
                  getFieldError('solution_idea') ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {getFieldError('solution_idea') && (
                <p className="text-rose-600 text-[11px] mt-1">{getFieldError('solution_idea')}</p>
              )}
            </div>

            {/* Plan & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  План работы (этапы) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Этап 1: исследование, Этап 2: прототип, Этап 3: сдача кода..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Срок реализации
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. 4 недели (первый демо через 10 дней)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />

                <label className="block text-xs font-semibold text-slate-700 mt-2 mb-1">
                  Ссылка на прототип / репозиторий / портфолио
                </label>
                <input
                  type="text"
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  placeholder="e.g. https://github.com/... или https://figma.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingProposal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submittingProposal ? 'Отправка предложения...' : 'Отправить предложение бизнесу'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* BUSINESS & ADMIN: Review Proposals & Select Team (Steps 7 & 8) */}
      {(role === 'business' || role === 'admin') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {awardNotification && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-bounce">
              <Award className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{awardNotification}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Поступившие предложения команд ({proposals.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Бизнес самостоятельно сравнивает отклики и вручную выбирает команду. Автоматическое назначение запрещено правилами.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {proposals.filter(p => p.status === 'Selected').length} выбрано
              </span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                {proposals.filter(p => p.status === 'Shortlisted').length} в шортлисте
              </span>
            </div>
          </div>

          {proposals.length === 0 ? (
            <EmptyState
              type="proposals"
              title="Пока нет откликов"
              description="Студенческие команды изучают опубликованную задачу в каталоге. Как только поступит предложение, оно появится здесь."
            />
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const isSelected = proposal.status === 'Selected';
                const isShortlisted = proposal.status === 'Shortlisted';
                const isRejected = proposal.status === 'Rejected';

                return (
                  <div
                    key={proposal.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-sm ring-2 ring-emerald-200'
                        : isShortlisted
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                        : isRejected
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Proposal Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {proposal.team_name}
                          </h4>
                          <span className="text-xs text-slate-600 font-medium">({proposal.student_name})</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isShortlisted
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {isSelected ? '🏆 Выбрана для работы (+100 XP)' : proposal.status}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium mt-0.5">
                          Связь: {proposal.student_contact} • Срок: {proposal.timeline || 'Не указан'}
                        </p>
                      </div>

                      {/* Manual Business Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectTeam(proposal.id, 'Shortlisted')}
                          disabled={updatingProposalId === proposal.id || isShortlisted}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 disabled:opacity-40 transition-colors"
                        >
                          В шортлист
                        </button>

                        <button
                          onClick={() => handleSelectTeam(proposal.id, 'Selected')}
                          disabled={updatingProposalId === proposal.id || isSelected}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-40 transition-colors flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Выбрать команду (+100 XP)</span>
                        </button>

                        <button
                          onClick={() => handleSelectTeam(proposal.id, 'Rejected')}
                          disabled={updatingProposalId === proposal.id || isRejected}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 disabled:opacity-40 transition-colors"
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>

                    {/* Proposal Details */}
                    <div className="space-y-2 text-xs text-slate-700 bg-white/90 p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">Идея решения: </span>
                        <span>{proposal.solution_idea || proposal.pitch}</span>
                      </div>

                      {proposal.plan && (
                        <div>
                          <span className="font-bold text-slate-900">План реализации: </span>
                          <span>{proposal.plan}</span>
                        </div>
                      )}

                      {proposal.prototype_url && (
                        <div className="flex items-center gap-1.5 pt-1 text-indigo-600 font-semibold">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <a href={proposal.prototype_url} target="_blank" rel="noreferrer" className="hover:underline">
                            Ссылка на прототип / репозиторий: {proposal.prototype_url}
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
