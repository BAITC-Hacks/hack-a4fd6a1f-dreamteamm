'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { UserRole, FieldError } from '@/lib/types';
import { 
  UserPlus, 
  Briefcase, 
  GraduationCap, 
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useRole();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [teamName, setTeamName] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          organization: role === 'business' ? organization : null,
          team_name: role === 'student' ? teamName : null,
          skills: role === 'student' ? skills : null,
          interests: role === 'student' ? interests : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([{ field: 'form', message: data.message || 'Ошибка регистрации' }]);
        }
        return;
      }

      login(data.token, data.user);
      router.push(data.user.role === 'business' ? '/admin' : '/catalog');
    } catch (err: any) {
      setErrors([{ field: 'server', message: err.message || 'Ошибка сети' }]);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(e => e.field === field)?.message;
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Создание аккаунта
        </h1>
        <p className="text-xs text-slate-500">
          Выберите вашу роль в системе AI Sana Hackathon
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            role === 'student'
              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Студент / Команда</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('business')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            role === 'business'
              ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Бизнес-партнер</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'student' ? 'ФИО капитана или имя' : 'Имя представителя бизнеса'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Дана Исаева"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {getFieldError('name') && (
              <p className="text-rose-600 text-[11px] mt-1">{getFieldError('name')}</p>
            )}
          </div>

          {/* Conditional: Business Organization vs Student Team Name */}
          {role === 'business' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Название компании / организации
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. FintechWorks Accounting"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Название команды
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CyberAlphas Team"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ключевые навыки команды (через запятую)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, FastAPI, React"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-600 mt-1">
                  Используется AI для подбора рекомендуемых задач в каталоге.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Интересующие темы / отрасли
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. FinTech, CleanTech, RecSys, Data"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {getFieldError('email') && (
              <p className="text-rose-600 text-[11px] mt-1">{getFieldError('email')}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Пароль (не менее 6 символов) <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {getFieldError('password') && (
              <p className="text-rose-600 text-[11px] mt-1">{getFieldError('password')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Уже есть учетная запись?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Войти
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
