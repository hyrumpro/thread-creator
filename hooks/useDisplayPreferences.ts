'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface DisplayPrefs {
  reduceMotion: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = 'display-prefs';

function getStored(): DisplayPrefs {
  if (typeof window === 'undefined') return { reduceMotion: false, highContrast: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { reduceMotion: false, highContrast: false };
  } catch {
    return { reduceMotion: false, highContrast: false };
  }
}

function applyToHtml(prefs: DisplayPrefs) {
  const html = document.documentElement;
  html.classList.toggle('reduce-motion', prefs.reduceMotion);
  html.classList.toggle('high-contrast', prefs.highContrast);
}

export function useDisplayPreferences() {
  const { resolvedTheme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<DisplayPrefs>({ reduceMotion: false, highContrast: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStored();
    setPrefs(stored);
    applyToHtml(stored);
    setMounted(true);
  }, []);

  const update = (key: keyof DisplayPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyToHtml(next);
  };

  return {
    theme: mounted ? (resolvedTheme ?? 'dark') : 'dark',
    setTheme,
    reduceMotion: prefs.reduceMotion,
    highContrast: prefs.highContrast,
    setReduceMotion: (v: boolean) => update('reduceMotion', v),
    setHighContrast: (v: boolean) => update('highContrast', v),
  };
}
