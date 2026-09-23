import { NextRequest, NextResponse } from 'next/server';
import { getAttachment } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = params.key;
    const attachment = getAttachment(key);

    if (!attachment) {
      return NextResponse.json({ message: 'Attachment not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(attachment.buffer), {
      status: 200,
      headers: {
        'Content-Type': attachment.content_type,
        'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.filename)}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
