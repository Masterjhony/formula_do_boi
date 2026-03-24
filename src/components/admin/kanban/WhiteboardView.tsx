'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import 'tldraw/tldraw.css';

// Remove CSS from globals if you imported it there, but having it here guarantees loading.
// Official pattern for Next.js App Router:
const TldrawDynamic = dynamic(async () => (await import('tldraw')).Tldraw, {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f9fafb] dark:bg-[#0A0A0A]">
      <div className="w-12 h-12 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-gray-500 font-medium">Carregando Lousa...</div>
    </div>
  ),
});

const TLDRAW_OPTIONS = { maxPages: 1 };

export function WhiteboardView() {
  const { theme, systemTheme } = useTheme();

  return (
    <div className="flex-1 w-full h-[calc(100vh-200px)] min-h-[600px] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden relative isolate">
      <div className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
        <TldrawDynamic persistenceKey="formula-boi-tactical-plan-v1" options={TLDRAW_OPTIONS} />
      </div>
    </div>
  );
}
