import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪞</span>
          <span className="font-display text-xl text-white">PersonaPath</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"  className="btn-ghost px-5 py-2.5 text-sm">Login</Link>
          <Link to="/signup" className="btn-primary px-5 py-2.5 text-sm">Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="absolute inset-0 glow-indigo pointer-events-none" />
        <div className="absolute inset-0 glow-purple pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-chip mb-8">
            <span>✨</span> AI-Powered Personality Analysis
          </div>
          <h1 className="font-display text-5xl sm:text-7xl text-white mb-6 leading-tight">
            Discover Your <span className="gradient-text">True Self</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            PersonaPath uses AI-driven quizzes, journaling, and data visualisation to help you
            understand, track, and grow your personality over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary px-8 py-4 text-base">
              Start Your Journey →
            </Link>
            <Link to="/login" className="btn-outline px-8 py-4 text-base">
              I have an account
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="relative z-10 mt-24 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
          {[
            { icon: '🧠', title: 'Big Five Analysis',  desc: 'Scientifically grounded personality scoring across 5 key dimensions' },
            { icon: '📈', title: 'Growth Tracking',    desc: 'Visualise how your traits evolve across multiple quiz attempts' },
            { icon: '📔', title: 'AI Journal',          desc: 'Write daily logs and get instant AI mood & trait analysis' },
          ].map(f => (
            <div key={f.title} className="glass-hover rounded-2xl p-6 text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="relative z-10 mt-16 flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
          {[
            { value: '50', label: 'Quiz Questions' },
            { value: '5',  label: 'Personality Traits' },
            { value: 'AI', label: 'Powered Insights' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl gradient-text">{s.value}</p>
              <p className="text-zinc-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-zinc-600 text-sm border-t border-zinc-800">
        © PersonaPath 
      </footer>
    </div>
  );
}
