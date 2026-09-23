'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { Task } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Award,
  Wand2,
  Flame,
  Check
} from 'lucide-react';

export default function HomePage() {
  const { user, role, isAuthenticated, quickDemoLogin } = useRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [role]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks?size=6`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setTasks(data.content || []);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  const priorityTasksCount = tasks.filter(t => t.readiness_score >= 90).length;
  const readyTasksCount = tasks.filter(t => t.readiness_score >= 70 && t.readiness_score < 90).length;
  const totalProposalsCount = tasks.reduce((acc, t) => acc + (t.proposals_count || 0), 0);
  const selectedTeamsCount = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner with Persona Indicator */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
            {role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />}
            {role === 'business' && <Briefcase className="w-3.5 h-3.5 text-indigo-400" />}
            {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
            <span>
              {user ? `${user.name} (${user.team_name || user.organization || user.role})` : `Режим: ${role === 'business' ? 'Бизнес' : role === 'admin' ? 'Администратор' : 'Студент'}`}
            </span>
            {role === 'student' && user && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                ⭐️ {user.xp_points || 0} XP
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Рейтинг качества бизнес-задач и открытый выбор студенческих команд
          </h1>

          <p className="mt-3 text-slate-300 text-xs sm:text-base leading-relaxed">
            {role === 'student'
              ? 'Изучайте структурированные практические задачи бизнеса, получайте персональные AI-рекомендации по навыкам вашей команды и подавайте предложения с прототипами.'
              : 'Превратите краткое описание потребности в полноценную карточку с помощью AI, наберите до 100 баллов готовности и выберите сильную студенческую команду.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Каталог задач с рейтингом</span>
            </Link>

            {(role === 'business' || role === 'admin') && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
              >
                <Wand2 className="w-4 h-4" />
                <span>Запустить AI-Конструктор карточки</span>
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20"
              >
                <span>Войти / Демо-вход</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Overview Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Приоритетные</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{priorityTasksCount}</span>
            <span className="text-xs text-purple-700 font-bold">90–100 б.</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-1">Топ каталога, максимальная проработка</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Готовые задачи</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{readyTasksCount}</span>
            <span className="text-xs text-emerald-700 font-bold">70–89 б.</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-1">Открыты к откликам студентов</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Предложения команд</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalProposalsCount}</span>
            <span className="text-xs text-indigo-700 font-bold">Откликов</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-1">Идеи, планы и прототипы решений</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Выбрано команд</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{selectedTeamsCount}</span>
            <span className="text-xs text-amber-700 font-bold">+100 XP</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-1">Команды в стадии реализации проекта</p>
        </div>

      </div>

      {/* 8-Step Hackathon Workflow Walkthrough */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Сквозной пользовательский сценарий хакатона AI Sana
            </h3>
            <p className="text-xs text-slate-500">
              От первоначального краткого черновика до подтверждения этапа и начисления баллов
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-200 hidden sm:inline-block">
            8 обязательных шагов
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-bold text-xs text-slate-900">1. Черновик</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Бизнес вводит краткое описание потребности или задачи.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-bold text-xs text-slate-900">2. Уточнение</h4>
            <p className="text-[11px] text-slate-500 leading-snug">AI определяет недостающие данные и задает не менее 3 вопросов.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-bold text-xs text-slate-900">3. Карточка</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Из ответов формируется карточка, которую бизнес подтверждает.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h4 className="font-bold text-xs text-slate-900">4. Рейтинг</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Система начисляет 0-100 баллов по 7 ключевым шкалам полноты.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">5</span>
            <h4 className="font-bold text-xs text-slate-900">5. Каталог</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Задача публикуется в общем пуле на позиции согласно рейтингу.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">6</span>
            <h4 className="font-bold text-xs text-slate-900">6. Выбор студентов</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Команды изучают каталог и подают план и прототип решения.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">7</span>
            <h4 className="font-bold text-xs text-slate-900">7. Выбор бизнеса</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Бизнес вручную выбирает команду (автоназначение запрещено).</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">8</span>
            <h4 className="font-bold text-xs text-slate-900">8. Прогресс (XP)</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Выбранная команда получает +100 баллов за фактический прогресс.</p>
          </div>

        </div>
      </div>

      {/* Top Ranking Tasks Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-600" />
              <span>Лидеры рейтинга готовности задач</span>
            </h2>
            <p className="text-xs text-slate-500">Задачи с максимальной проработкой требований в топе каталога</p>
          </div>

          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Весь каталог</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-16 bg-slate-100 rounded w-full mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            type="error"
            title="Ошибка загрузки"
            description={error}
            actionText="Повторить"
            onAction={fetchTasks}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            type="tasks"
            title="Каталог пуст"
            description="Запустите генерацию задач или сбросьте базу данных до эталонных значений."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
