import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border border-primary-500/30 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <span className="text-2xl">🪞</span>
        </div>
      </div>
      <p className="font-display text-xl text-zinc-300 mb-1">PersonaPath</p>
      <p className="text-zinc-500 text-sm font-mono">Loading your mirror…</p>
    </div>
  );
}
