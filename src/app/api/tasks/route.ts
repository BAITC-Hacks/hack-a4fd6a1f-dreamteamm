import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateReadinessScore } from '@/lib/readiness';
import { matchTaskForTeam } from '@/lib/ai-assistant';
import { getAuthUserFromRequest } from '@/lib/auth';
import { FieldError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(req.url);

    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    const tier = url.searchParams.get('tier');
    const tag = url.searchParams.get('tag');
    const q = url.searchParams.get('q');
    const sort = url.searchParams.get('sort') || 'rating'; // default sort by readiness rating

    const page = Math.max(0, parseInt(url.searchParams.get('page') || '0', 10));
    const size = Math.max(1, Math.min(100, parseInt(url.searchParams.get('size') || '10', 10)));
    const offset = page * size;

    const authUser = getAuthUserFromRequest(req);

    const conditions: string[] = [];
    const params: any[] = [];

    // All published tasks are visible to all teams according to hackathon rules!
    // Low rating does NOT hide tasks.
    if (status && status !== 'All') {
      conditions.push('tasks.status = ?');
      params.push(status);
    }

    if (category && category !== 'All') {
      conditions.push('tasks.category = ?');
      params.push(category);
    }

    if (priority && priority !== 'All') {
      conditions.push('tasks.priority = ?');
      params.push(priority);
    }

    if (tier && tier !== 'All') {
      conditions.push('tasks.readiness_tier = ?');
      params.push(tier);
    }

    if (tag) {
      conditions.push('tasks.tags LIKE ?');
      params.push(`%${tag}%`);
    }

    if (q && q.trim()) {
      conditions.push('(tasks.title LIKE ? OR tasks.notes LIKE ? OR tasks.tags LIKE ? OR tasks.context_need LIKE ?)');
      const searchParam = `%${q.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM tasks ${whereClause}`;
    const totalRow = db.prepare(countQuery).get(...params) as { total: number };
    const totalElements = totalRow ? totalRow.total : 0;
    const totalPages = Math.ceil(totalElements / size);

    // Sorting: By Rating (highest readiness score first), or Newest, or Proposals
    let orderClause = 'ORDER BY tasks.readiness_score DESC, tasks.id DESC';
    if (sort === 'newest') {
      orderClause = 'ORDER BY tasks.id DESC';
    } else if (sort === 'proposals') {
      orderClause = 'ORDER BY proposals_count DESC, tasks.readiness_score DESC';
    }

    const tasksQuery = `
      SELECT tasks.*, 
             COUNT(proposals.id) as proposals_count
      FROM tasks
      LEFT JOIN proposals ON proposals.task_id = tasks.id
      ${whereClause}
      GROUP BY tasks.id
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const rawTasks = db.prepare(tasksQuery).all(...params, size, offset) as any[];

    // Annotate with AI team matching if student is authenticated
    const tasks = rawTasks.map((t) => {
      let isRecommended = false;
      let matchPercentage = 0;
      let matchReason = '';

      if (authUser && authUser.role === 'student' && authUser.skills) {
        const match = matchTaskForTeam(
          { category: t.category, tags: t.tags, title: t.title, notes: t.notes },
          authUser.skills,
          authUser.interests
        );
        isRecommended = match.isRecommended;
        matchPercentage = match.matchPercentage;
        matchReason = match.reason;
      }

      return {
        ...t,
        is_recommended: isRecommended,
        match_percentage: matchPercentage,
        match_reason: matchReason
      };
    });

    return NextResponse.json({
      content: tasks,
      page,
      size,
      totalElements,
      totalPages
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const authUser = getAuthUserFromRequest(req);
    const body = await req.json();

    const errors: FieldError[] = [];

    const title = (body.title || '').trim();
    const category = (body.category || '').trim();
    const owner = (body.owner || authUser?.organization || authUser?.name || '').trim();
    const priority = body.priority || 'Medium';
    const status = body.status || 'Draft';
    const tags = (body.tags || '').trim();
    const attachment_key = body.attachment_key || null;
    const attachment_name = body.attachment_name || null;

    // 8 Hackathon fields
    const context_need = (body.context_need || body.notes || '').trim();
    const data_materials = (body.data_materials || '').trim();
    const expected_result = (body.expected_result || '').trim();
    const success_criteria = (body.success_criteria || '').trim();
    const constraints = (body.constraints || '').trim();
    const target_users = (body.target_users || '').trim();
    const business_contact = (body.business_contact || '').trim();

    if (!title) {
      errors.push({ field: 'title', message: 'Название задачи обязательно' });
    } else if (title.length < 5) {
      errors.push({ field: 'title', message: 'Название должно быть не менее 5 символов' });
    }

    if (!category) {
      errors.push({ field: 'category', message: 'Категория/отрасль обязательна' });
    }

    if (!owner) {
      errors.push({ field: 'owner', message: 'Укажите представителя или компанию' });
    }

    if (!context_need) {
      errors.push({ field: 'context_need', message: 'Опишите контекст и потребность задачи' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Compute exact Hackathon rating & tier
    const scoreResult = calculateReadinessScore({
      title,
      context_need,
      data_materials,
      expected_result,
      success_criteria,
      constraints,
      target_users,
      business_contact
    });

    const now = new Date().toISOString().split('T')[0];
    const combinedNotes = body.notes || `### 1. Контекст и проблема\n${context_need}\n\n### 2. Данные и материалы\n${data_materials}\n\n### 3. Ожидаемый результат\n${expected_result}\n\n### 4. Критерии успеха\n${success_criteria}\n\n### 5. Ограничения и стек\n${constraints}\n\n### 6. Целевые пользователи\n${target_users}\n\n### 7. Связь с бизнесом\n${business_contact}`;

    const stmt = db.prepare(`
      INSERT INTO tasks (
        title, category, owner_id, owner, status, priority, tags,
        context_need, data_materials, expected_result, success_criteria, constraints, target_users, business_contact,
        notes, readiness_score, readiness_tier, last_updated, attachment_key, attachment_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title,
      category,
      authUser?.id || null,
      owner,
      status,
      priority,
      tags,
      context_need,
      data_materials,
      expected_result,
      success_criteria,
      constraints,
      target_users,
      business_contact,
      combinedNotes,
      scoreResult.score,
      scoreResult.tier,
      now,
      attachment_key,
      attachment_name
    );

    const createdTask = db.prepare(`
      SELECT tasks.*, 0 as proposals_count FROM tasks WHERE id = ?
    `).get(info.lastInsertRowid);

    return NextResponse.json({
      task: createdTask,
      readiness: scoreResult
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
