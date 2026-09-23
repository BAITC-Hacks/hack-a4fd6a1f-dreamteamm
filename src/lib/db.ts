import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedDatabase } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'workflow.db');

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      organization TEXT,
      team_name TEXT,
      skills TEXT,
      interests TEXT,
      xp_points INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      owner_id INTEGER REFERENCES users(id),
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft',
      priority TEXT NOT NULL DEFAULT 'Medium',
      tags TEXT NOT NULL DEFAULT '',
      context_need TEXT NOT NULL DEFAULT '',
      data_materials TEXT NOT NULL DEFAULT '',
      expected_result TEXT NOT NULL DEFAULT '',
      success_criteria TEXT NOT NULL DEFAULT '',
      constraints TEXT NOT NULL DEFAULT '',
      target_users TEXT NOT NULL DEFAULT '',
      business_contact TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      readiness_score INTEGER NOT NULL DEFAULT 0,
      readiness_tier TEXT NOT NULL DEFAULT 'draft',
      last_updated TEXT NOT NULL,
      attachment_key TEXT,
      attachment_name TEXT
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id),
      team_name TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_contact TEXT NOT NULL,
      solution_idea TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL DEFAULT '',
      timeline TEXT NOT NULL DEFAULT '',
      prototype_url TEXT NOT NULL DEFAULT '',
      pitch TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Submitted',
      stage_points_awarded INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      attachment_key TEXT,
      attachment_name TEXT
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      feedback_type TEXT NOT NULL DEFAULT 'platform',
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storage_key TEXT UNIQUE NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL,
      file_data BLOB
    );
  `);

  // Ensure new columns exist if upgraded from older database
  try {
    db.prepare('SELECT context_need FROM tasks LIMIT 1').get();
  } catch (e) {
    // Migration: recreate tables cleanly with seed
    seedDatabase(db);
    return;
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase(db);
  }
}

export function resetAndSeedDb() {
  const db = getDb();
  seedDatabase(db);
  return { success: true, message: 'База данных успешно сброшена и заполнена демо-данными!' };
}
