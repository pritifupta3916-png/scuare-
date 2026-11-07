import React from 'react';
import { User } from '../types';
import { Wrench, ShieldAlert, UserCheck, LogOut, Sun, Moon, Cpu, Database } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeTab: 'catalog' | 'admin' | 'ai-diagnostics';
  setActiveTab: (tab: 'catalog' | 'admin' | 'ai-diagnostics') => void;
  onOpenAuthModal: () => void;
  onOpenSchemaModal: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenSchemaModal,
  onLogout,
  darkMode,
  setDarkMode,
}) => {
  const isAdmin = currentUser?.role === 'DEVELOPER/ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 text-left focus:outline-none group py-1"
          >
            <img
              src="/assets/aistudio/Gemini_Generated_Image_aadv19aadv19aadv_ca9c83a0.png"
              alt="MOBILE LIX PARTS Logo"
              className="h-10 sm:h-11 w-auto object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
            />
          </button>
        </div>

        {/* Zone 2: Single-line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'catalog'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spare Parts Catalog
          </button>

          <button
            onClick={() => setActiveTab('ai-diagnostics')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'ai-diagnostics'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>AI Symptom Diagnostic</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Developer / Admin Console</span>
              </button>

              <button
                onClick={onOpenSchemaModal}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
                title="Inspect Database Schema (User, SparePart, SearchLog)"
              >
                <Database className="w-3.5 h-3.5" />
                <span>DB Schema Spec</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action + Utility Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1 justify-end">
                  {currentUser.name}
                  {isAdmin && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Admin
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentUser.phone}
                </span>
              </div>

              {isAdmin && activeTab !== 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Admin Console
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
