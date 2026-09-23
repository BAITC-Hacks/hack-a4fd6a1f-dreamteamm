import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { FieldError } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Некорректный ID задачи' }] }, { status: 400 });
    }

    const task = db.prepare('SELECT id, title, owner FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return NextResponse.json({ message: 'Задача не найдена' }, { status: 404 });
    }

    const proposals = db.prepare(`
      SELECT * FROM proposals
      WHERE task_id = ?
      ORDER BY id DESC
    `).all(taskId);

    return NextResponse.json({
      task_id: taskId,
      proposals
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Некорректный ID задачи' }] }, { status: 400 });
    }

    const task = db.prepare('SELECT id, status FROM tasks WHERE id = ?').get(taskId) as any;
    if (!task) {
      return NextResponse.json({ message: 'Задача не найдена' }, { status: 404 });
    }

    const authUser = getAuthUserFromRequest(req);
    const body = await req.json();
    const errors: FieldError[] = [];

    const team_name = (body.team_name || authUser?.team_name || 'Студенческая команда').trim();
    const student_name = (body.student_name || authUser?.name || '').trim();
    const student_contact = (body.student_contact || authUser?.email || '').trim();
    const solution_idea = (body.solution_idea || body.pitch || '').trim();
    const plan = (body.plan || '').trim();
    const timeline = (body.timeline || '').trim();
    const prototype_url = (body.prototype_url || '').trim();
    const attachment_key = body.attachment_key || null;
    const attachment_name = body.attachment_name || null;

    if (!student_name) {
      errors.push({ field: 'student_name', message: 'Укажите ваше имя или представителя команды' });
    }
    if (!student_contact) {
      errors.push({ field: 'student_contact', message: 'Укажите контакт для связи (Telegram или Email)' });
    }
    if (!solution_idea || solution_idea.length < 15) {
      errors.push({ field: 'solution_idea', message: 'Опишите идею решения задачи (не менее 15 символов)' });
    }
    if (!plan || plan.length < 10) {
      errors.push({ field: 'plan', message: 'Укажите краткий план реализации (этапы работ)' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const combinedPitch = `${solution_idea}\n\nПлан:\n${plan}\n\nСрок: ${timeline || 'По согласованию'}\nСсылка: ${prototype_url || 'Будет предоставлена'}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO proposals (
        task_id, student_id, team_name, student_name, student_contact,
        solution_idea, plan, timeline, prototype_url, pitch,
        status, stage_points_awarded, created_at, attachment_key, attachment_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 0, ?, ?, ?)
    `);

    const result = stmt.run(
      taskId,
      authUser?.id || null,
      team_name,
      student_name,
      student_contact,
      solution_idea,
      plan,
      timeline,
      prototype_url,
      combinedPitch,
      now,
      attachment_key,
      attachment_name
    );

    const created = db.prepare('SELECT * FROM proposals WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      proposal: created,
      message: 'Предложение успешно отправлено бизнесу на рассмотрение!'
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
