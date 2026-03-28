import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TraitCard from '../components/dashboard/TraitCard';
import RadarChart from '../components/dashboard/RadarChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import BadgeGrid from '../components/dashboard/BadgeGrid';
import { TRAIT_CONFIG, formatRelativeTime, MOOD_CONFIG } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [trend, setTrend]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/analysis/trend').catch(() => ({ data: null }))
    ]).then(([statsRes, trendRes]) => {
      setStats(statsRes.data);
      setTrend(trendRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { latestPersonality, insights, recentJournals } = stats || {};
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">
            Good {greeting},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Here's your personality snapshot</p>
        </div>
        <Link to="/quiz" className="btn-primary px-6 py-3 text-sm self-start sm:self-auto">
          ◈ Take Quiz
        </Link>
      </div>

      {/* ── Stat pills ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Taken',   value: stats?.user?.totalQuizzes   || 0, icon: '◈', color: 'text-primary-400' },
          { label: 'Journal Entries', value: stats?.user?.totalJournals  || 0, icon: '◫', color: 'text-emerald-400'  },
          { label: 'Day Streak',      value: stats?.user?.streakCount    || 0, icon: '🔥', color: 'text-orange-400'  },
          { label: 'Badges Earned',   value: stats?.user?.badges?.length || 0, icon: '🏆', color: 'text-yellow-400'  },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className={`font-mono font-bold text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Empty state ────────────────────────────────── */}
      {!latestPersonality && (
        <div className="glass rounded-2xl p-12 text-center border border-dashed border-zinc-700">
          <p className="text-5xl mb-4">🧠</p>
          <h2 className="font-display text-2xl text-white mb-2">Take your first personality quiz</h2>
          <p className="text-zinc-400 mb-6 text-sm max-w-md mx-auto">
            Discover your Big Five personality profile with 20 science-backed questions.
            Takes about 10 minutes.
          </p>
          <Link to="/quiz" className="btn-primary px-10 py-3.5">Start Now →</Link>
        </div>
      )}

      {/* ── Main personality section ────────────────────── */}
      {latestPersonality && (
        <>
          {/* Personality type banner */}
          <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 glow-indigo pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 flex-1">
              <span className="text-5xl">{latestPersonality.personalityType?.split(' ')[0]}</span>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Your Personality Type</p>
                <p className="font-display text-2xl text-white">{latestPersonality.personalityType}</p>
                <p className="text-zinc-400 text-xs mt-1 capitalize">
                  Dominant: <span className="text-primary-300">{latestPersonality.dominantTrait?.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
            <Link to="/analysis" className="btn-outline text-sm px-5 py-2.5 relative z-10 flex-shrink-0">
              Full Analysis →
            </Link>
          </div>

          {/* Radar + Trait bars */}
          <div className="grid lg:grid-cols-2 gap-6">
            <RadarChart scores={latestPersonality.scores} title="Personality Radar" />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Trait Scores</h3>
              {Object.keys(TRAIT_CONFIG).map(trait => (
                <TraitCard key={trait} trait={trait} score={latestPersonality.scores[trait]} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Growth trend ────────────────────────────────── */}
      {trend?.chartData?.length >= 2 && (
        <TrendLineChart chartData={trend.chartData} />
      )}

      {/* ── Insights + Recent journals ──────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top insights */}
        {insights && (
          <div className="glass rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Top Insights</h3>

            <div>
              <p className="text-xs text-zinc-500 uppercase mb-3 tracking-wide font-medium">💪 Strengths</p>
              <ul className="space-y-2">
                {insights.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase mb-3 tracking-wide font-medium">🎯 Career Paths</p>
              <div className="flex flex-wrap gap-2">
                {insights.careers.map((c, i) => (
                  <span key={i} className="badge-chip text-primary-300 border-primary-500/20 text-xs">{c}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase mb-3 tracking-wide font-medium">💡 Quick Tips</p>
              <ul className="space-y-2">
                {insights.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/analysis" className="btn-outline w-full py-2.5 text-sm text-center block">
              See Full Analysis →
            </Link>
          </div>
        )}

        {/* Recent journal entries */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Recent Journals</h3>
            <Link to="/journal" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>

          {recentJournals?.length > 0 ? (
            <div className="space-y-3">
              {recentJournals.map(j => (
                <div
                  key={j._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/60 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{MOOD_CONFIG[j.mood]?.emoji || '😐'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{j.title}</p>
                    <p className="text-xs text-zinc-500">{formatRelativeTime(j.createdAt)}</p>
                  </div>
                  {/* Sentiment dot */}
                  {j.aiAnalysis?.sentiment !== undefined && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: j.aiAnalysis.sentiment > 0.2
                          ? '#34d399' : j.aiAnalysis.sentiment < -0.2
                          ? '#f87171' : '#94a3b8'
                      }}
                      title={`Sentiment: ${j.aiAnalysis.sentiment}`}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">📔</p>
              <p className="text-zinc-500 text-sm mb-4">No journal entries yet</p>
              <Link to="/journal" className="btn-outline text-sm px-6 py-2.5">Write First Entry</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Badges ─────────────────────────────────────── */}
      <BadgeGrid badges={stats?.user?.badges || []} />

    </div>
  );
}
