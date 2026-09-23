'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  RotateCcw, 
  PlusCircle, 
  BookOpen, 
  LayoutDashboard, 
  MessageSquare,
  Sparkles,
  Check,
  LogIn,
  LogOut,
  Award,
  User,
  Wand2
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout, quickDemoLogin } = useRole();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = async () => {
    if (!confirm('Вы уверены, что хотите сбросить базу данных к эталонным демо-данным хакатона?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
        window.location.reload();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Дашборд', icon: LayoutDashboard },
    { href: '/catalog', label: 'Каталог задач', icon: BookOpen },
    ...(role === 'business' || role === 'admin' ? [
      { href: '/admin', label: 'Конструктор задач', icon: Wand2 },
    ] : []),
    { href: '/feedback', label: 'Обратная связь', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  TaskCard <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">AI Sana</span>
                </span>
                <p className="text-[11px] text-slate-700 font-medium hidden sm:block">Рейтинг бизнес-задач & выбор команд</p>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: Role Demo Switcher & Auth */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Demo Role Switcher for Jury */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => quickDemoLogin('student')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'student'
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Демо-вход: Студенческая команда"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Студент</span>
              </button>

              <button
                onClick={() => quickDemoLogin('business')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'business'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Демо-вход: Бизнес-представитель"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Бизнес</span>
              </button>

              <button
                onClick={() => quickDemoLogin('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-white text-purple-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Демо-вход: Администратор"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Админ</span>
              </button>
            </div>

            {/* Student XP Points Badge (Gamification Step 8) */}
            {role === 'student' && user && (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm"
                title="Баллы прогресса команды за выполнение этапов"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>{user.xp_points || 0} XP</span>
              </div>
            )}

            {/* Reset Sample Data Button */}
            <button
              onClick={handleResetData}
              disabled={resetting}
              title="Сбросить базу данных до эталонных 8 задач и 4 предложений"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {resetSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold hidden sm:inline">Сброшено</span>
                </>
              ) : (
                <>
                  <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-indigo-600' : ''}`} />
                  <span className="hidden sm:inline">Сброс данных</span>
                </>
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate max-w-[140px]">
                    {user.team_name || user.organization || user.role}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Выйти из аккаунта"
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Войти</span>
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Submenu & Role Bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-600 font-medium">Демо-роль:</span>
            <button
              onClick={() => quickDemoLogin('student')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${role === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Студент
            </button>
            <button
              onClick={() => quickDemoLogin('business')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${role === 'business' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Бизнес
            </button>
            <button
              onClick={() => quickDemoLogin('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Админ
            </button>
          </div>

          {role === 'student' && user && (
            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] shrink-0">
              ⭐️ {user.xp_points || 0} XP
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
