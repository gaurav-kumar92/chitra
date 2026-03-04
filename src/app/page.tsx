
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>Loading Editor...</p>
    </div>
  ),
});

export default function Page() {
  return <Editor />;
}
