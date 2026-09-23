import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { FieldError } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const errors: FieldError[] = [];

    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email) {
      errors.push({ field: 'email', message: 'Введите email' });
    }
    if (!password) {
      errors.push({ field: 'password', message: 'Введите пароль' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const user = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email) as any;

    if (!user) {
      return NextResponse.json({
        errors: [{ field: 'email', message: 'Пользователь с таким email не найден' }]
      }, { status: 400 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({
        errors: [{ field: 'password', message: 'Неверный пароль' }]
      }, { status: 400 });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      team_name: user.team_name,
      skills: user.skills,
      interests: user.interests,
      xp_points: user.xp_points,
      created_at: user.created_at
    };

    const response = NextResponse.json({
      user: safeUser,
      token,
      message: 'Вход выполнен успешно!'
    }, { status: 200 });

    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message || 'Ошибка сервера при входе' }]
    }, { status: 500 });
  }
}
