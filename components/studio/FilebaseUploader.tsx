'use client';

import { useRef, useState } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/validators';

interface FilebaseUploaderProps {
  folder:
    | 'avatars'
    | 'banners'
    | 'resumes'
    | 'projects'
    | 'project-files'
    | 'hackathons'
    | 'feed'
    | 'certificates';
  accept?: string;
  label?: string;
  onUploaded: (result: {
    fileName: string;
    fileSizeBytes: number;
    filebaseKey: string;
    publicUrl: string;
    contentType: string;
  }) => void;
}

export default function FilebaseUploader({
  folder,
  accept,
  label = 'Upload to Filebase S3',
  onUploaded,
}: FilebaseUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastFile, setLastFile] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setUploading(true);
    try {
      const presignRes = await fetch('/api/v1/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSizeBytes: file.size || 1024,
        }),
      });
      const presign = await presignRes.json();
      if (!presignRes.ok) {
        toast.error(presign.error || 'Presign rejected');
        return;
      }

      if (presign.mode === 'filebase-s3' && presign.uploadUrl) {
        const putRes = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) {
          toast.error('Direct Filebase S3 upload failed');
          return;
        }
      }

      setLastFile(`${file.name} (${formatFileSize(file.size)})`);
      toast.success(
        presign.mode === 'filebase-s3'
          ? `Uploaded ${file.name} to Filebase S3`
          : `Attached ${file.name} (Preview Filebase mode)`
      );
      onUploaded({
        fileName: file.name,
        fileSizeBytes: file.size || 1024,
        filebaseKey: presign.filebaseKey,
        publicUrl: presign.publicUrl,
        contentType: file.type || 'application/octet-stream',
      });
    } catch {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void processFile(file);
      }}
      className={`rounded-2xl border border-dashed p-4 text-center transition-colors ${
        dragging
          ? 'border-[#0033FF] bg-[#0033FF]/10'
          : 'border-black/20 bg-white/60 dark:border-white/20 dark:bg-[#141416]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void processFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition-colors hover:border-[#0033FF] hover:text-[#0033FF] disabled:opacity-50 dark:border-white/20"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : lastFile ? (
          <Check className="h-3.5 w-3.5 text-[#0033FF]" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        <span>{uploading ? 'Presigning & uploading...' : label}</span>
      </button>
      <p className="mt-2 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
        {lastFile ? `Ready: ${lastFile}` : 'Drag & drop or click · Presigned Filebase S3 PUT'}
      </p>
    </div>
  );
}
