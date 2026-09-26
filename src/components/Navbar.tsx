import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DemoTimerBadge } from './DemoTimerBadge';
import { ThemeSelector } from './ThemeSelector';
import { 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  LogIn, 
  LayoutDashboard 
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'portal' | 'admin' | 'product_details';
  setCurrentView: (view: 'home' | 'portal' | 'admin' | 'product_details') => void;
  onOpenLogin: (tab?: 'admin' | 'client') => void;
  onOpenRequestTime?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenLogin,
  onOpenRequestTime
}) => {
  const { currentUser, clientProfile, isAdmin, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('home')} 
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  WebCraft Goods
                  <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Showcase
                  </span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Interactive HTML Digital Tools & Planners
                </span>
              </div>
            </button>

            {/* Main Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  currentView === 'home'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Catalog Showcase
              </button>

              {currentUser && (
                <button
                  onClick={() => setCurrentView('portal')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    currentView === 'portal'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Client Portal
                </button>
              )}

              <button
                onClick={() => {
                  if (isAdmin) {
                    setCurrentView('admin');
                  } else {
                    onOpenLogin('admin');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
                {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Admin Active" />}
              </button>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Live demo timer badge */}
            <DemoTimerBadge onExtendClick={onOpenRequestTime} />

            {/* Theme switcher */}
            <ThemeSelector />

            {/* Authentication / User State */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span className="truncate max-w-[150px]">
                    {clientProfile?.fullName || (isAdmin ? 'Admin' : currentUser.email)}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition flex items-center gap-1.5"
                  title="Admin Portal Login"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Admin Login</span>
                </button>
                <button
                  onClick={() => onOpenLogin('client')}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Client Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
