'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export default function SafeImage({ src, alt, className = '', fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[#EAEAE5] text-[#52525B] dark:bg-[#141416] dark:text-[#8E8E93] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Layers className="h-6 w-6 opacity-50" />
        <span className="px-4 text-center font-mono text-xs">{fallbackLabel || alt}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
