import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { sanitizeS3FileName } from './validators';

export interface PresignResult {
  mode: 'filebase-s3' | 'preview-local';
  uploadUrl: string | null;
  filebaseKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}

export function isFilebaseConfigured(): boolean {
  return Boolean(
    process.env.FILEBASE_BUCKET &&
      process.env.FILEBASE_ACCESS_KEY_ID &&
      process.env.FILEBASE_SECRET_ACCESS_KEY
  );
}

function getFilebaseClient(): S3Client {
  return new S3Client({
    endpoint: process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com',
    region: process.env.FILEBASE_REGION || 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY || '',
    },
  });
}

export async function createFilebasePresignedPut(params: {
  folder: string;
  fileName: string;
  contentType: string;
  memberId: string;
}): Promise<PresignResult> {
  const safeName = sanitizeS3FileName(params.fileName);
  const nonce = crypto.randomBytes(6).toString('hex');
  const datePrefix = new Date().toISOString().slice(0, 10);
  const filebaseKey = `${params.folder}/${datePrefix}/${params.memberId}-${nonce}-${safeName}`;

  if (!isFilebaseConfigured()) {
    // Preview mode when Filebase credentials are not yet set in .env
    const fallbackImage =
      params.folder === 'hackathons'
        ? '/images/hackathon-editorial.jpg'
        : params.folder === 'feed'
          ? '/images/feed-typography-card.jpg'
          : '/images/project-ai-vision.jpg';

    const isImage = params.contentType.startsWith('image/');
    return {
      mode: 'preview-local',
      uploadUrl: null,
      filebaseKey,
      publicUrl: isImage ? fallbackImage : `/api/v1/uploads/preview-file?key=${encodeURIComponent(filebaseKey)}`,
      expiresInSeconds: 600,
    };
  }

  const bucket = process.env.FILEBASE_BUCKET!;
  const client = getFilebaseClient();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: filebaseKey,
    ContentType: params.contentType,
  });

  const expiresInSeconds = 600;
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const baseUrl = (process.env.FILEBASE_PUBLIC_BASE_URL || 'https://s3.filebase.com').replace(/\/$/, '');
  const publicUrl = `${baseUrl}/${bucket}/${filebaseKey}`;

  return {
    mode: 'filebase-s3',
    uploadUrl,
    filebaseKey,
    publicUrl,
    expiresInSeconds,
  };
}
