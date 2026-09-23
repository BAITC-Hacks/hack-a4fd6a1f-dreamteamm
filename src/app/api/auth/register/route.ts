import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { FieldError, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const errors: FieldError[] = [];

    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const name = (body.name || '').trim();
    const role: UserRole = body.role || 'student';
    const organization = (body.organization || '').trim() || null;
    const team_name = (body.team_name || '').trim() || null;
    const skills = (body.skills || '').trim() || null;
    const interests = (body.interests || '').trim() || null;

    if (!email || !email.includes('@')) {
      errors.push({ field: 'email', message: 'Введите корректный email адрес' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Пароль должен содержать не менее 6 символов' });
    }
    if (!name || name.length < 2) {
      errors.push({ field: 'name', message: 'Имя или название обязательно' });
    }
    if (!['business', 'student', 'admin'].includes(role)) {
      errors.push({ field: 'role', message: 'Роль должна быть business или student' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({
        errors: [{ field: 'email', message: 'Пользователь с таким email уже зарегистрирован' }]
      }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, organization, team_name, skills, interests, xp_points, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    const result = stmt.run(
      email,
      password_hash,
      name,
      role,
      organization,
      team_name,
      skills,
      interests,
      now
    );

    const newUser = db.prepare(`
      SELECT id, email, name, role, organization, team_name, skills, interests, xp_points, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid) as any;

    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    const response = NextResponse.json({
      user: newUser,
      token,
      message: 'Регистрация успешна!'
    }, { status: 201 });

    // Set cookie for browser sessions
    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message || 'Ошибка сервера при регистрации' }]
    }, { status: 500 });
  }
}
