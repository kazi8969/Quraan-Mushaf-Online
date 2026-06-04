'use client';

import { memo } from 'react';

export const BismillahHeader = memo(function BismillahHeader() {
  return (
    <div className="bismillah-container text-center my-2">
      <p
        className="font-amiri text-[var(--page-text)] leading-relaxed"
        style={{ fontSize: '1.5em' }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
    </div>
  );
});
