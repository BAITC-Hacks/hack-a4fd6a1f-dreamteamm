'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { 
  LogIn, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin, isAuthenticated, user } = useRole();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0]?.message || data.message || 'Ошибка входа');
        return;
      }

      login(data.token, data.user);
      router.push(data.user.role === 'business' ? '/admin' : '/catalog');
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: 'business' | 'student' | 'admin') => {
    setLoading(true);
    await quickDemoLogin(role);
    setLoading(false);
    router.push(role === 'business' ? '/admin' : '/catalog');
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Вход в систему TaskCard
        </h1>
        <p className="text-xs text-slate-500">
          AI Sana Хакатон: Авторизация с разделением ролей и JWT токенами
        </p>
      </div>

      {/* Quick Demo Login Box */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-3xl border border-indigo-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Быстрый демо-вход для жюри (1 клик):</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('business')}
            className="flex flex-col items-center p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">Бизнес</span>
            <span className="text-[9px] text-slate-500">Задачи & выбор</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('student')}
            className="flex flex-col items-center p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">Студент</span>
            <span className="text-[9px] text-slate-500">Команда & XP</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('admin')}
            className="flex flex-col items-center p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">Админ</span>
            <span className="text-[9px] text-slate-500">Модерация</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Пароль
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Вход в аккаунт...' : 'Войти по паролю'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Еще нет аккаунта?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Зарегистрироваться
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
