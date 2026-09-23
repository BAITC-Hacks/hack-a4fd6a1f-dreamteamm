import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb } from './db';

const ATTACHMENTS_DIR = path.join(process.cwd(), 'data', 'attachments');
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

export interface StoredAttachment {
  storage_key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
}

export function saveAttachment(
  filename: string,
  contentType: string,
  buffer: Buffer
): StoredAttachment {
  const db = getDb();
  const fileExt = path.extname(filename);
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const sanitizedName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  const storage_key = `${sanitizedName}_${randomSuffix}${fileExt}`;
  const uploaded_at = new Date().toISOString();

  // Save file to disk
  const filePath = path.join(ATTACHMENTS_DIR, storage_key);
  fs.writeFileSync(filePath, buffer);

  // Record in DB
  const stmt = db.prepare(`
    INSERT INTO attachments (storage_key, filename, content_type, size_bytes, uploaded_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(storage_key, filename, contentType, buffer.length, uploaded_at);

  return {
    storage_key,
    filename,
    content_type: contentType,
    size_bytes: buffer.length,
    uploaded_at
  };
}

export function getAttachment(storage_key: string): {
  filename: string;
  content_type: string;
  buffer: Buffer;
} | null {
  const db = getDb();
  const meta = db.prepare(`
    SELECT filename, content_type FROM attachments WHERE storage_key = ?
  `).get(storage_key) as { filename: string; content_type: string } | undefined;

  const filePath = path.join(ATTACHMENTS_DIR, storage_key);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return {
      filename: meta?.filename || storage_key,
      content_type: meta?.content_type || 'application/octet-stream',
      buffer
    };
  }

  // Fallback for seed mock attachments if physical file hasn't been written to disk
  return {
    filename: meta?.filename || storage_key,
    content_type: 'application/pdf',
    buffer: Buffer.from(`Sample content for attachment: ${storage_key}\nGenerated for hackathon demo.`)
  };
}
