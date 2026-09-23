import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const proposalId = parseInt(params.id, 10);
    if (isNaN(proposalId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Некорректный ID предложения' }] }, { status: 400 });
    }

    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId) as any;
    if (!proposal) {
      return NextResponse.json({ message: 'Предложение не найдено' }, { status: 404 });
    }

    const body = await req.json();
    const status = body.status;
    const validStatuses = ['Submitted', 'Shortlisted', 'Selected', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({
        errors: [{ field: 'status', message: `Статус должен быть одним из: ${validStatuses.join(', ')}` }]
      }, { status: 400 });
    }

    let pointsAwarded = proposal.stage_points_awarded;

    // Gamification Step 8: When business manually selects a team, award XP progress points!
    if (status === 'Selected' && proposal.status !== 'Selected') {
      pointsAwarded = 100; // Award 100 XP for stage selection
      if (proposal.student_id) {
        db.prepare('UPDATE users SET xp_points = xp_points + 100 WHERE id = ?').run(proposal.student_id);
      }
      // Also update task status to 'In Progress'
      db.prepare("UPDATE tasks SET status = 'In Progress' WHERE id = ?").run(proposal.task_id);
    }

    db.prepare(`
      UPDATE proposals 
      SET status = ?, stage_points_awarded = ? 
      WHERE id = ?
    `).run(status, pointsAwarded, proposalId);

    const updated = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId);
    return NextResponse.json({
      proposal: updated,
      message: status === 'Selected' 
        ? 'Команда успешно выбрана! Ей начислено +100 баллов прогресса (XP).' 
        : `Статус предложения изменен на ${status}.`
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
