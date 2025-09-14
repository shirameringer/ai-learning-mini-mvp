// web/src/components/BrandLogo.tsx
import React from 'react';

type Props = { size?: number };

export default function BrandLogo({ size = 22 }: Props) {
  /* Minimalist: a diamond with a small gradient */
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfa24f" />
          <stop offset="100%" stopColor="#22c1c3" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="32" height="32" rx="8" fill="url(#g)" />
    </svg>
  );
}
