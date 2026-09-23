import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateReadinessScore } from '@/lib/readiness';
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

    const task = db.prepare(`
      SELECT tasks.*, COUNT(proposals.id) as proposals_count
      FROM tasks
      LEFT JOIN proposals ON proposals.task_id = tasks.id
      WHERE tasks.id = ?
      GROUP BY tasks.id
    `).get(taskId) as any;

    if (!task) {
      return NextResponse.json({ message: 'Задача не найдена' }, { status: 404 });
    }

    const readiness = calculateReadinessScore(task);

    return NextResponse.json({
      task,
      readiness
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Некорректный ID задачи' }] }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    if (!existing) {
      return NextResponse.json({ message: 'Задача не найдена' }, { status: 404 });
    }

    const body = await req.json();
    const errors: FieldError[] = [];

    const title = body.title !== undefined ? String(body.title).trim() : existing.title;
    const category = body.category !== undefined ? String(body.category).trim() : existing.category;
    const owner = body.owner !== undefined ? String(body.owner).trim() : existing.owner;
    const status = body.status !== undefined ? body.status : existing.status;
    const priority = body.priority !== undefined ? body.priority : existing.priority;
    const tags = body.tags !== undefined ? String(body.tags).trim() : existing.tags;
    
    const context_need = body.context_need !== undefined ? String(body.context_need).trim() : existing.context_need;
    const data_materials = body.data_materials !== undefined ? String(body.data_materials).trim() : existing.data_materials;
    const expected_result = body.expected_result !== undefined ? String(body.expected_result).trim() : existing.expected_result;
    const success_criteria = body.success_criteria !== undefined ? String(body.success_criteria).trim() : existing.success_criteria;
    const constraints = body.constraints !== undefined ? String(body.constraints).trim() : existing.constraints;
    const target_users = body.target_users !== undefined ? String(body.target_users).trim() : existing.target_users;
    const business_contact = body.business_contact !== undefined ? String(body.business_contact).trim() : existing.business_contact;
    const notes = body.notes !== undefined ? String(body.notes).trim() : existing.notes;
    const attachment_key = body.attachment_key !== undefined ? body.attachment_key : existing.attachment_key;
    const attachment_name = body.attachment_name !== undefined ? body.attachment_name : existing.attachment_name;

    if (!title) {
      errors.push({ field: 'title', message: 'Название обязательно' });
    }
    if (!category) {
      errors.push({ field: 'category', message: 'Категория обязательна' });
    }
    if (!owner) {
      errors.push({ field: 'owner', message: 'Владелец обязателен' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

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

    db.prepare(`
      UPDATE tasks
      SET title = ?, category = ?, owner = ?, status = ?, priority = ?, tags = ?,
          context_need = ?, data_materials = ?, expected_result = ?, success_criteria = ?,
          constraints = ?, target_users = ?, business_contact = ?, notes = ?,
          readiness_score = ?, readiness_tier = ?, last_updated = ?, attachment_key = ?, attachment_name = ?
      WHERE id = ?
    `).run(
      title,
      category,
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
      notes,
      scoreResult.score,
      scoreResult.tier,
      now,
      attachment_key,
      attachment_name,
      taskId
    );

    const updatedTask = db.prepare(`
      SELECT tasks.*, COUNT(proposals.id) as proposals_count
      FROM tasks
      LEFT JOIN proposals ON proposals.task_id = tasks.id
      WHERE tasks.id = ?
      GROUP BY tasks.id
    `).get(taskId);

    return NextResponse.json({
      task: updatedTask,
      readiness: scoreResult
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ errors: [{ field: 'id', message: 'Некорректный ID' }] }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    if (result.changes === 0) {
      return NextResponse.json({ message: 'Задача не найдена' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Задача #${taskId} удалена` }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}
