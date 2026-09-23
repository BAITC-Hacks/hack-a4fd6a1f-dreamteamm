'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import { Feedback, Task, FieldError } from '@/lib/types';
import EmptyState from '@/components/EmptyState';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  HelpCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';

export default function FeedbackPage() {
  const { user, role } = useRole();

  const [userNameInput, setUserNameInput] = useState(user?.name || '');
  const [feedbackType, setFeedbackType] = useState<'platform' | 'task' | 'feature' | 'bug'>('platform');
  const [taskIdInput, setTaskIdInput] = useState<string>('');
  const [content, setContent] = useState('');
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin view feedback list
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    // Fetch tasks for dropdown
    fetch('/api/tasks?size=50')
      .then(res => res.json())
      .then(data => setAvailableTasks(data.content || []))
      .catch(console.error);

    if (role === 'admin') {
      fetchAdminFeedback();
    }
  }, [role]);

  const fetchAdminFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userNameInput,
          feedback_type: feedbackType,
          task_id: taskIdInput ? parseInt(taskIdInput, 10) : null,
          content
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          setFormErrors([{ field: 'form', message: data.message || 'Submission failed' }]);
        }
        return;
      }

      setSuccessMessage('Thank you! Your feedback has been recorded for review.');
      setContent('');
      if (role === 'admin') {
        fetchAdminFeedback();
      }
    } catch (err: any) {
      setFormErrors([{ field: 'server', message: err.message || 'Error sending feedback' }]);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return formErrors.find(e => e.field === field)?.message;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Platform & Task Feedback</span>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Open Communication
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your experience, suggest workflow improvements, or leave feedback on specific business briefs.
        </p>
      </div>

      {/* Submission Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* User Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name / Role Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="e.g. Alex Rivera or Prof. Davis"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  getFieldError('user_name') ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {getFieldError('user_name') && (
                <p className="text-rose-600 text-[11px] mt-1">{getFieldError('user_name')}</p>
              )}
            </div>

            {/* Feedback Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback Focus
              </label>
              <select
                value={feedbackType}
                onChange={(e: any) => setFeedbackType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="platform">General Platform Feedback</option>
                <option value="task">Specific Task Card Feedback</option>
                <option value="feature">New Feature Suggestion</option>
                <option value="bug">Bug / Usability Issue</option>
              </select>
            </div>

          </div>

          {/* Linked Task Optional */}
          {feedbackType === 'task' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Associated Task Card
              </label>
              <select
                value={taskIdInput}
                onChange={(e) => setTaskIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Choose a task --</option>
                {availableTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.title} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Feedback Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide constructive feedback, suggestions for improving the brief, or questions..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed ${
                getFieldError('content') ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {getFieldError('content') && (
              <p className="text-rose-600 text-[11px] mt-1">{getFieldError('content')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>

        </form>
      </div>

      {/* Admin Feedback Log (Visible when in Admin Persona) */}
      {role === 'admin' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Admin Feedback Inbox ({feedbackList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Review submitted feedback messages across all tasks and platform areas.
              </p>
            </div>
          </div>

          {loadingFeedback ? (
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ) : feedbackList.length === 0 ? (
            <EmptyState
              type="feedback"
              title="No feedback entries"
              description="Feedback messages submitted by users will appear here."
            />
          ) : (
            <div className="space-y-3">
              {feedbackList.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.user_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px] uppercase">
                        {item.feedback_type}
                      </span>
                      {item.task_title && (
                        <span className="text-indigo-600 font-medium truncate max-w-xs">
                          Task: {item.task_title}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
