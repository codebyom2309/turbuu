import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createFilebasePresignedPut } from '@/lib/filebase';
import { presignSchema, validateUploadRequest } from '@/lib/validators';

/**
 * POST /api/v1/uploads/presign
 * Generates a Filebase S3-compatible Presigned PUT URL for direct client-to-S3 uploads
 * (avatars, banners, resumes, hackathon photos, certificates, project APKs/PDFs/PPTX/ZIPs).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = presignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid upload metadata' },
        { status: 400 }
      );
    }

    const fileCheck = validateUploadRequest(parsed.data.fileName, parsed.data.fileSizeBytes);
    if (!fileCheck.ok) {
      return NextResponse.json({ error: fileCheck.error }, { status: 400 });
    }

    const presign = await createFilebasePresignedPut({
      folder: parsed.data.folder,
      fileName: parsed.data.fileName,
      contentType: parsed.data.contentType,
      memberId: auth.ctx.member.id,
    });

    return NextResponse.json(presign);
  } catch {
    return NextResponse.json({ error: 'Unable to generate presigned upload URL' }, { status: 500 });
  }
}
