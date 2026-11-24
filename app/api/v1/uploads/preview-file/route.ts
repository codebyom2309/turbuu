import { NextRequest, NextResponse } from 'next/server';
import { sanitizeS3FileName } from '@/lib/validators';

/**
 * GET /api/v1/uploads/preview-file?key=...
 * Safe preview download manifest served when Filebase S3 credentials are not yet supplied in .env,
 * allowing end-to-end verification of Downloads Vault and Resume downloads without broken links.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || 'turbobits-artifact.txt';
  const fileName = sanitizeS3FileName(key.split('/').pop() || 'turbobits-artifact.txt');

  const manifest = [
    'TURBOBITS (turbobits.in) — FILEBASE S3 ARTIFACT MANIFEST (PREVIEW MODE)',
    '======================================================================',
    `Object Key : ${key}`,
    `File Name  : ${fileName}`,
    `Generated  : ${new Date().toISOString()}`,
    '',
    'This download link is backed by Filebase S3 Presigned Uploads in production.',
    'Configure FILEBASE_BUCKET, FILEBASE_ACCESS_KEY_ID, and FILEBASE_SECRET_ACCESS_KEY',
    'in your .env file to serve binary APK / PDF / PPTX / ZIP objects directly from Filebase.',
  ].join('\n');

  return new NextResponse(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}.txt"`,
      'Cache-Control': 'no-store',
    },
  });
}
