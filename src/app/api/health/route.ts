import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as alive').get() as { alive: number };
    
    return NextResponse.json({
      status: 'UP',
      database: result.alive === 1 ? 'connected' : 'unreachable',
      timestamp: new Date().toISOString(),
      service: 'Workflow Tool — Task Card MVP',
      version: '1.0.0'
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'DOWN',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
