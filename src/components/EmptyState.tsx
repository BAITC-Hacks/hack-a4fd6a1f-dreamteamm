'use client';

import React from 'react';
import { 
  FolderSearch, 
  FileQuestion, 
  Inbox, 
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'tasks' | 'proposals' | 'error' | 'feedback';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'tasks',
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  const getDefaults = () => {
    switch (type) {
      case 'search':
        return {
          icon: FolderSearch,
          title: title || 'No matching task cards found',
          desc: description || 'Try clearing some filters or searching with different keywords.',
          btn: actionText || 'Clear Filters',
        };
      case 'proposals':
        return {
          icon: Inbox,
          title: title || 'No proposals submitted yet',
          desc: description || 'As students discover this published task in the catalog, their proposals will appear here.',
          btn: actionText,
        };
      case 'error':
        return {
          icon: AlertTriangle,
          title: title || 'Unable to load records',
          desc: description || 'An error occurred while fetching data from the server. Please check connection and retry.',
          btn: actionText || 'Retry',
        };
      case 'feedback':
        return {
          icon: Inbox,
          title: title || 'No feedback received yet',
          desc: description || 'Feedback submitted by students and business partners will be listed here.',
          btn: actionText,
        };
      case 'tasks':
      default:
        return {
          icon: FileQuestion,
          title: title || 'No task cards available',
          desc: description || 'There are currently no tasks listed under this view. Click below to create one or seed sample tasks.',
          btn: actionText || 'Create Task Card',
        };
    }
  };

  const config = getDefaults();
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {config.title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
        {config.desc}
      </p>

      {onAction && config.btn && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {type === 'error' ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{config.btn}</span>
          </button>
        </div>
      )}
    </div>
  );
}
