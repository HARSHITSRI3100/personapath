import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '⬡',  label: 'Dashboard' },
  { to: '/quiz',        icon: '◈',  label: 'Take Quiz' },
  { to: '/analysis',   icon: '◉',  label: 'Insights' },
  { to: '/ai-insights', icon: '✦',  label: 'AI Analysis', badge: 'GPT-4o' },
  { to: '/chat',        icon: '💬', label: 'Career Coach', badge: 'New' },
  { to: '/journal',     icon: '◫',  label: 'Journal' },
  { to: '/history',     icon: '◷',  label: 'History' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
            <span className="text-base">🪞</span>
          </div>
          <div>
            <p className="font-display text-lg text-white leading-none">PersonaPath</p>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">v2.0 · AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
              }`
            }
          >
            <span className="text-base font-mono w-5 text-center">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-600/40 text-primary-300 border border-primary-500/30">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {user?.streakCount > 0 && (
        <div className="mx-3 mb-3 px-4 py-3 glass rounded-xl">
          <p className="text-xs text-zinc-500 mb-1">Current Streak</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-orange-400 font-mono">{user.streakCount} days</span>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800/70 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-purple-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-200 truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all text-lg">
            ↩
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900/80 border-r border-zinc-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <span className="text-xl">☰</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base">🪞</span>
            <span className="font-display text-lg text-white">PersonaPath</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-700 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
            {getInitials(user?.name)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
