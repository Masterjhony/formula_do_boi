'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export function WhiteboardView() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#f9fafb] dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-[#222222]">
        <div className="w-12 h-12 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium">Carregando Lousa...</div>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <div className="flex-1 w-full h-full min-h-[600px] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden relative">
      <div className="absolute inset-0">
        <Tldraw 
            darkMode={isDark} 
            inferDarkMode={false}
        />
      </div>
    </div>
  );
}
