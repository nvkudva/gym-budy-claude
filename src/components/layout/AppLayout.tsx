import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import type { Tab } from '../../context/AppContext';
import { GOAL_META } from '../../types';

const TABS: { id: Tab; label: string; icon: (active: boolean) => ReactNode }[] = [
  {
    id: 'plan',
    label: 'Plan',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.5}
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: 'workout',
    label: 'Workout',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'AI Coach',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { activeTab, setActiveTab, profile, clearProfile } = useApp();

  const goalMeta = profile ? GOAL_META[profile.goal] : null;

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Ambient warm orbs — subtle, like the reference */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-amber-700/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-80 h-80 bg-orange-800/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-600/20">
            <span className="text-lg">🏋️</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              {profile?.name}
            </div>
            {goalMeta && (
              <div className="flex items-center gap-1">
                <span className="text-[11px]">{goalMeta.emoji}</span>
                <span className="text-white/35 text-[11px]">{goalMeta.label}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => { if (confirm('Reset your profile and plan?')) clearProfile(); }}
          className="w-8 h-8 rounded-full glass glass-hover flex items-center justify-center"
          title="Reset"
        >
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {children}
      </main>

      {/* Bottom nav — CodePen 3-layer glass + dark active pill */}
      <nav className="relative z-20 px-5 pb-6 pt-3">
        <div
          className="lg-container lg-container--rounded mx-auto max-w-sm"
          style={{ display: 'flex' }}
        >
          <div className="lg-filter" />
          <div className="lg-overlay" />
          <div className="lg-specular" />
          {/* Content */}
          <div className="relative z-10 flex-1 flex items-center justify-around px-1 py-1.5">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ transition: 'all 0.4s var(--lg-bounce)' }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl relative
                    ${isActive ? 'nav-pill-active -my-1 scale-105' : 'hover:bg-white/[0.05] active:scale-95'}`}
                >
                  {tab.icon(isActive)}
                  <span className={`text-[10px] font-medium ${isActive ? 'text-amber-400' : 'text-white/25'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
