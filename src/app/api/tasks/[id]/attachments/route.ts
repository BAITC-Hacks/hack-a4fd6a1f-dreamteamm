import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { saveAttachment } from '@/lib/storage';
import { calculateReadinessScore } from '@/lib/readiness';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Invalid task ID' }] }, { status: 400 });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        errors: [{ field: 'file', message: 'No file uploaded' }]
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const stored = saveAttachment(file.name, file.type || 'application/octet-stream', buffer);

    // Update task's attachment_key and attachment_name
    db.prepare(`
      UPDATE tasks 
      SET attachment_key = ?, attachment_name = ?
      WHERE id = ?
    `).run(stored.storage_key, stored.filename, taskId);

    // Recalculate readiness score now that an attachment is present
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    const scoreResult = calculateReadinessScore(updatedTask);
    db.prepare('UPDATE tasks SET readiness_score = ? WHERE id = ?').run(scoreResult.score, taskId);

    return NextResponse.json({
      storage_key: stored.storage_key,
      filename: stored.filename,
      size_bytes: stored.size_bytes,
      content_type: stored.content_type,
      readiness_score: scoreResult.score
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
