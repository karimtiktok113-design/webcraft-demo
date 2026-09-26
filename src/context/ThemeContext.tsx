import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName } from '../types';

interface ThemeConfig {
  id: ThemeName;
  name: string;
  bgClass: string;
  cardBgClass: string;
  textClass: string;
  mutedTextClass: string;
  borderClass: string;
  accentClass: string;
  accentBgClass: string;
  accentHoverClass: string;
  navBgClass: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  'premium-light': {
    id: 'premium-light',
    name: 'Premium Light',
    bgClass: 'bg-slate-50',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-900',
    mutedTextClass: 'text-slate-500',
    borderClass: 'border-slate-200',
    accentClass: 'text-indigo-600',
    accentBgClass: 'bg-indigo-600 text-white',
    accentHoverClass: 'hover:bg-indigo-700',
    navBgClass: 'bg-slate-900 text-white',
    isDark: false,
  },
  'professional-dark': {
    id: 'professional-dark',
    name: 'Professional Dark',
    bgClass: 'bg-slate-950',
    cardBgClass: 'bg-slate-900',
    textClass: 'text-slate-100',
    mutedTextClass: 'text-slate-400',
    borderClass: 'border-slate-800',
    accentClass: 'text-indigo-400',
    accentBgClass: 'bg-indigo-600 text-white',
    accentHoverClass: 'hover:bg-indigo-500',
    navBgClass: 'bg-black text-white',
    isDark: true,
  },
  'midnight-navy': {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    bgClass: 'bg-[#0b132b]',
    cardBgClass: 'bg-[#1c2541]',
    textClass: 'text-slate-100',
    mutedTextClass: 'text-slate-300',
    borderClass: 'border-[#3a506b]/40',
    accentClass: 'text-[#48cae4]',
    accentBgClass: 'bg-[#48cae4] text-[#0b132b]',
    accentHoverClass: 'hover:bg-[#00b4d8]',
    navBgClass: 'bg-[#060c1d] text-white',
    isDark: true,
  },
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple',
    bgClass: 'bg-[#120824]',
    cardBgClass: 'bg-[#1e1035]',
    textClass: 'text-purple-50',
    mutedTextClass: 'text-purple-300/70',
    borderClass: 'border-purple-800/40',
    accentClass: 'text-purple-400',
    accentBgClass: 'bg-purple-600 text-white',
    accentHoverClass: 'hover:bg-purple-500',
    navBgClass: 'bg-[#0d041a] text-white',
    isDark: true,
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    bgClass: 'bg-sky-950',
    cardBgClass: 'bg-sky-900/80',
    textClass: 'text-sky-50',
    mutedTextClass: 'text-sky-300',
    borderClass: 'border-sky-800/60',
    accentClass: 'text-cyan-400',
    accentBgClass: 'bg-cyan-500 text-sky-950 font-semibold',
    accentHoverClass: 'hover:bg-cyan-400',
    navBgClass: 'bg-sky-950 border-b border-sky-800 text-white',
    isDark: true,
  },
  'emerald': {
    id: 'emerald',
    name: 'Emerald Forest',
    bgClass: 'bg-[#062117]',
    cardBgClass: 'bg-[#0d3326]',
    textClass: 'text-emerald-50',
    mutedTextClass: 'text-emerald-300/70',
    borderClass: 'border-emerald-800/40',
    accentClass: 'text-emerald-400',
    accentBgClass: 'bg-emerald-500 text-slate-950 font-bold',
    accentHoverClass: 'hover:bg-emerald-400',
    navBgClass: 'bg-[#03150f] text-white',
    isDark: true,
  },
  'slate': {
    id: 'slate',
    name: 'Slate Precision',
    bgClass: 'bg-slate-100',
    cardBgClass: 'bg-white',
    textClass: 'text-slate-800',
    mutedTextClass: 'text-slate-500',
    borderClass: 'border-slate-300',
    accentClass: 'text-slate-900',
    accentBgClass: 'bg-slate-800 text-white',
    accentHoverClass: 'hover:bg-slate-900',
    navBgClass: 'bg-slate-800 text-white',
    isDark: false,
  },
  'minimal-white': {
    id: 'minimal-white',
    name: 'Minimal White',
    bgClass: 'bg-white',
    cardBgClass: 'bg-neutral-50',
    textClass: 'text-neutral-900',
    mutedTextClass: 'text-neutral-500',
    borderClass: 'border-neutral-200',
    accentClass: 'text-black',
    accentBgClass: 'bg-black text-white',
    accentHoverClass: 'hover:bg-neutral-800',
    navBgClass: 'bg-white border-b border-neutral-200 text-neutral-900',
    isDark: false,
  },
};

interface ThemeContextType {
  theme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeName }> = ({
  children,
  initialTheme = 'premium-light',
}) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('wc_preferred_theme') as ThemeName;
    return saved && THEMES[saved] ? saved : initialTheme;
  });

  const setTheme = (newTheme: ThemeName) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      localStorage.setItem('wc_preferred_theme', newTheme);
    }
  };

  const themeConfig = THEMES[theme] || THEMES['premium-light'];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeConfig.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, themeConfig.isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      <div className={`min-h-screen ${themeConfig.bgClass} ${themeConfig.textClass} transition-colors duration-200`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
