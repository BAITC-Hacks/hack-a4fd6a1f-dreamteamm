import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FieldError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const feedbackList = db.prepare(`
      SELECT feedback.*, tasks.title as task_title
      FROM feedback
      LEFT JOIN tasks ON tasks.id = feedback.task_id
      ORDER BY feedback.id DESC
    `).all();

    return NextResponse.json({ feedback: feedbackList }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const errors: FieldError[] = [];

    const user_name = (body.user_name || '').trim();
    const content = (body.content || '').trim();
    const feedback_type = body.feedback_type || 'platform';
    const task_id = body.task_id ? parseInt(body.task_id, 10) : null;

    if (!user_name) {
      errors.push({ field: 'user_name', message: 'Name is required' });
    }
    if (!content) {
      errors.push({ field: 'content', message: 'Feedback text is required' });
    } else if (content.length < 5) {
      errors.push({ field: 'content', message: 'Feedback must be at least 5 characters' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO feedback (task_id, user_name, feedback_type, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(task_id, user_name, feedback_type, content, now);
    const created = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      feedback: created,
      message: 'Feedback received. Thank you!'
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
