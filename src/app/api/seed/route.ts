import { NextResponse } from 'next/server';
import { resetAndSeedDb } from '@/lib/db';

export async function POST() {
  try {
    const result = resetAndSeedDb();
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
