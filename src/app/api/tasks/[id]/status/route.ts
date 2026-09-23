import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Invalid task ID' }] }, { status: 400 });
    }

    const body = await req.json();
    const status = body.status;
    const validStatuses = ['Draft', 'Needs Info', 'Published', 'In Progress', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({
        errors: [{ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` }]
      }, { status: 400 });
    }

    const now = new Date().toISOString().split('T')[0];
    const result = db.prepare(`
      UPDATE tasks SET status = ?, last_updated = ? WHERE id = ?
    `).run(status, now, taskId);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    return NextResponse.json({ task: updated }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
