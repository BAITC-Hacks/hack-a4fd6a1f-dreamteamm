import { NextRequest, NextResponse } from 'next/server';
import { analyzeDraftAndGenerateQuestions } from '@/lib/ai-assistant';
import { TaskCategory } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const draft = (body.draft || '').trim();
    const category: TaskCategory = body.category || 'Engineering';

    if (!draft) {
      return NextResponse.json({
        errors: [{ field: 'draft', message: 'Введите краткое описание задачи или проблемы' }]
      }, { status: 400 });
    }

    const result = analyzeDraftAndGenerateQuestions(draft, category);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
