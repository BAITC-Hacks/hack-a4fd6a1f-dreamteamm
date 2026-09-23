'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import { Task, TaskCategory, TaskPriority, TaskStatus, ReadinessTier } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Layers
} from 'lucide-react';

const CATEGORIES = ['All', 'Engineering', 'Data', 'Design', 'Business', 'CleanTech', 'FinTech'];
const TIERS = [
  { id: 'All', label: 'Все уровни готовности' },
  { id: 'priority', label: '🔥 Приоритетные (90–100)' },
  { id: 'ready', label: '🟢 Готовые (70–89)' },
  { id: 'working', label: '🟡 Рабочие (40–69)' },
  { id: 'draft', label: '🔴 Черновики (0–39)' }
];

export default function CatalogPage() {
  const { user, role, token } = useRole();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'proposals'>('rating');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedCategory, selectedTier, selectedTag, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [page, searchQuery, selectedCategory, selectedTier, selectedTag, sortBy, token]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', pageSize.toString());
      params.append('sort', sortBy);

      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedTier !== 'All') params.append('tier', selectedTier);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Ошибка при загрузке каталога`);
      const data = await res.json();

      setTasks(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки каталога');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTier('All');
    setSelectedTag('');
    setSortBy('rating');
    setPage(0);
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedCategory !== 'All' || 
    selectedTier !== 'All' || 
    selectedTag !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Общий каталог бизнес-задач
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {totalElements} {totalElements === 1 ? 'задача' : 'задач'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ключевой принцип хакатона: чем выше качество и полнота карточки, тем выше её позиция в общем каталоге.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить фильтры</span>
          </button>
        )}
      </div>

      {/* Student Team Banner if Logged In */}
      {role === 'student' && user && user.team_name && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">{user.team_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {user.xp_points || 0} XP
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Навыки команды: <span className="font-semibold text-slate-800">{user.skills || 'Python, ML, React'}</span>. Задачи с совпадением отмечены бейджем «Рекомендовано вам».
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, контексту проблемы, данным или технологиям..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="rating">🔥 По рейтингу качества (по умолчанию)</option>
              <option value="newest">🕒 По дате обновления</option>
              <option value="proposals">👥 По числу откликов</option>
            </select>
          </div>
        </div>

        {/* Row 2: Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Отрасль:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'Все отрасли' : cat}
            </button>
          ))}
        </div>

        {/* Row 3: Readiness Tiers Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Уровень готовности:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTier === tier.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Catalog Cards Grid */}
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
          title="Ошибка загрузки каталога"
          description={error}
          actionText="Повторить"
          onAction={fetchTasks}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          type={hasActiveFilters ? 'search' : 'tasks'}
          title={hasActiveFilters ? 'По вашим фильтрам ничего не найдено' : 'Каталог пуст'}
          description={
            hasActiveFilters
              ? 'Попробуйте сбросить фильтры уровня готовности или очистить поисковый запрос.'
              : 'В каталоге пока нет опубликованных задач. Представители бизнеса могут создать первую задачу.'
          }
          actionText={hasActiveFilters ? 'Сбросить фильтры' : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-sm text-xs font-medium text-slate-600">
          <div>
            Страница <span className="font-bold text-slate-900">{page + 1}</span> из{' '}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalElements} задач)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <span>Вперед</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
