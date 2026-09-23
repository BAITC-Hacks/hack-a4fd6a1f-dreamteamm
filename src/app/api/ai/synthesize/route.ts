import { NextRequest, NextResponse } from 'next/server';
import { synthesizeTaskCard } from '@/lib/ai-assistant';
import { calculateReadinessScore } from '@/lib/readiness';
import { getAuthUserFromRequest } from '@/lib/auth';
import { TaskCategory } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);
    const body = await req.json();

    const title = (body.title || '').trim() || 'Разработка решения бизнес-задачи';
    const category: TaskCategory = body.category || 'Engineering';
    const initialDraft = (body.initialDraft || '').trim();
    const answers = body.answers || {};

    const ownerInfo = {
      name: authUser?.name || body.owner || 'Бизнес-представитель',
      organization: authUser?.organization || undefined
    };

    const taskFields = synthesizeTaskCard(title, category, initialDraft, answers, ownerInfo);
    const scoreResult = calculateReadinessScore(taskFields);

    return NextResponse.json({
      card: taskFields,
      readiness: scoreResult
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
