'use client';

import React from 'react';
import Link from 'next/link';
import { Task, TaskCategory, TaskPriority, TaskStatus, ReadinessTier } from '@/lib/types';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Paperclip,
  Users,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';

interface TaskCardProps {
  task: Task & { is_recommended?: boolean; match_percentage?: number; match_reason?: string };
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Engineering: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Design: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Data: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Business: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CleanTech: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  FinTech: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Published: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'In Progress': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  'Needs Info': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
};

export const PRIORITY_COLORS: Record<TaskPriority, { dot: string }> = {
  High: { dot: 'bg-rose-500' },
  Medium: { dot: 'bg-amber-500' },
  Low: { dot: 'bg-slate-400' },
};

export default function TaskCard({ task }: TaskCardProps) {
  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Engineering;
  const statColor = STATUS_COLORS[task.status] || STATUS_COLORS.Draft;
  const priColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;

  const tags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Plain text preview of context or notes
  const notesExcerpt = (task.context_need || task.notes || '')
    .replace(/[#*`_>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);

  // Hackathon Readiness Tiers:
  // 90-100 Priority: выделяется в каталоге
  // 70-89 Ready
  // 40-69 Working
  // 0-39 Draft
  const getTierBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Приоритетная',
        style: 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold shadow-sm',
        icon: Flame,
        cardBorder: 'border-purple-300 shadow-md ring-1 ring-purple-100'
      };
    }
    if (score >= 70) {
      return {
        label: 'Готовая задача',
        style: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        icon: CheckCircle2,
        cardBorder: 'border-slate-200 hover:border-emerald-300'
      };
    }
    if (score >= 40) {
      return {
        label: 'Рабочая задача',
        style: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        icon: Sparkles,
        cardBorder: 'border-slate-200 hover:border-amber-300'
      };
    }
    return {
      label: 'Требует уточнения',
      style: 'bg-rose-100 text-rose-800 border-rose-300 font-medium',
      icon: AlertTriangle,
      cardBorder: 'border-slate-200 hover:border-rose-300'
    };
  };

  const tierInfo = getTierBadge(task.readiness_score);
  const TierIcon = tierInfo.icon;

  return (
    <div className={`group bg-white rounded-2xl border ${tierInfo.cardBorder} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden`}>
      
      {/* Top Banner if Top Priority Task */}
      {task.readiness_score >= 90 && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <Flame className="w-3 h-3" />
          <span>Топ Рейтинг</span>
        </div>
      )}

      {/* Top Header Tags */}
      <div>
        
        {/* AI Team Match Recommendation Ribbon */}
        {task.is_recommended && (
          <div className="mb-3 p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{task.match_reason || 'Рекомендовано вашей команде!'}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Pill */}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
              {task.category}
            </span>

            {/* Status Pill */}
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${statColor.bg} ${statColor.text} ${statColor.border}`}>
              {task.status}
            </span>

            {/* Priority */}
            <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              <span className={`w-1.5 h-1.5 rounded-full ${priColor.dot}`} />
              {task.priority}
            </span>
          </div>

          {/* Readiness Score Pill with Tier */}
          <div 
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs border ${tierInfo.style}`}
            title={`Рейтинг готовности: ${task.readiness_score}/100 • Уровень: ${tierInfo.label}`}
          >
            <TierIcon className="w-3.5 h-3.5" />
            <span>{task.readiness_score} б.</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/tasks/${task.id}`} className="block">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
            {task.title}
          </h3>
        </Link>

        {/* Notes Excerpt */}
        <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
          {notesExcerpt}{notesExcerpt.length >= 140 ? '...' : ''}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[11px] text-slate-600 font-medium px-1">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Owner */}
          <span className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[130px]" title={task.owner}>
            <User className="w-3.5 h-3.5 shrink-0 text-slate-600" />
            <span className="truncate">{task.owner.split('(')[0].trim()}</span>
          </span>

          {/* Proposals Count */}
          <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold" title="Отклики студенческих команд">
            <Users className="w-3.5 h-3.5" />
            <span>{task.proposals_count || 0}</span>
          </span>

          {/* Has Attachment */}
          {task.attachment_key && (
            <span title="Материалы прикреплены" className="text-slate-600">
              <Paperclip className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* View Link */}
        <Link 
          href={`/tasks/${task.id}`}
          className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5 duration-200"
        >
          <span>Карточка</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
