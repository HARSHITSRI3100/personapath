import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import RadarChart from '../components/dashboard/RadarChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import MoodDoughnutChart from '../components/dashboard/MoodDoughnutChart';
import TraitCard from '../components/dashboard/TraitCard';
import { TRAIT_CONFIG, formatDate } from '../utils/helpers';

function InsightList({ title, items, color, icon }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-4">{icon} {title}</h3>
      <ul className="space-y-2.5">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className={`${color} mt-0.5 flex-shrink-0 font-bold`}>•</span>
            <span className="text-zinc-300 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState(null);
  const [trend, setTrend]       = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analysis/latest').catch(() => ({ data: null })),
      api.get('/analysis/trend').catch(() => ({ data: null })),
      api.get('/analysis/mood-trend').catch(() => ({ data: null })),
    ]).then(([a, t, m]) => {
      setAnalysis(a.data);
      setTrend(t.data);
      setMoodData(m.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-40 rounded-2xl" />)}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center py-24">
        <p className="text-6xl mb-4">🧠</p>
        <h2 className="font-display text-2xl text-white mb-3">No analysis yet</h2>
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          Take the personality quiz to unlock your full AI-powered insights, growth trends, and career recommendations.
        </p>
        <Link to="/quiz" className="btn-primary px-10 py-3.5">Take Quiz Now →</Link>
      </div>
    );
  }

  const { scores, insights, personalityType, dominantTrait, completedAt } = analysis;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">AI Insights</h1>
          <p className="text-zinc-400 text-sm mt-1">Based on assessment from {formatDate(completedAt)}</p>
        </div>
        <Link to="/quiz" className="btn-outline text-sm px-5 py-2.5 flex-shrink-0">
          Retake Quiz ↺
        </Link>
      </div>

      {/* ── Personality type hero ─────────────────────── */}
      <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 glow-indigo pointer-events-none" />
        <div className="absolute inset-0 glow-purple pointer-events-none" />
        <div className="relative z-10">
          <p className="text-7xl mb-4">{personalityType?.split(' ')[0]}</p>
          <h2 className="font-display text-4xl text-white mb-3">
            {personalityType?.split(' ').slice(1).join(' ')}
          </h2>
          <p className="text-zinc-400 text-sm">
            Dominant trait:{' '}
            <span className="text-primary-300 font-semibold capitalize">
              {dominantTrait?.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RadarChart scores={scores} title="Personality Radar" />
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Trait Scores</h3>
          {Object.keys(TRAIT_CONFIG).map(trait => (
            <TraitCard key={trait} trait={trait} score={scores[trait]} />
          ))}
        </div>
      </div>

      {/* ── Growth trend ─────────────────────────────── */}
      {trend?.chartData?.length >= 2 ? (
        <TrendLineChart chartData={trend.chartData} />
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-zinc-500 text-sm">
            Take more quizzes to see your growth trend over time. 
            Currently have <strong className="text-zinc-400">{trend?.totalAttempts || 1}</strong> attempt(s).
          </p>
        </div>
      )}

      {/* ── Mood chart ───────────────────────────────── */}
      {moodData && (
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <MoodDoughnutChart moodDistribution={moodData.moodDistribution} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Journal Mood Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Total Journal Entries</span>
                <span className="font-mono font-bold text-white">{moodData.totalEntries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Average Sentiment</span>
                <span
                  className="font-mono font-bold"
                  style={{
                    color: moodData.averageSentiment > 0.1 ? '#34d399'
                      : moodData.averageSentiment < -0.1 ? '#f87171'
                      : '#94a3b8'
                  }}
                >
                  {moodData.averageSentiment > 0.1 ? '😊 Positive'
                    : moodData.averageSentiment < -0.1 ? '😔 Negative'
                    : '😐 Neutral'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Score</span>
                <span className="font-mono text-zinc-300">{moodData.averageSentiment.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Insight cards ─────────────────────────────── */}
      {insights && (
        <div className="grid sm:grid-cols-2 gap-6">
          <InsightList title="Strengths"        items={insights.strengths}  color="text-emerald-400" icon="💪" />
          <InsightList title="Growth Areas"     items={insights.weaknesses} color="text-amber-400"   icon="⚠️" />
          <InsightList title="Improvement Tips" items={insights.tips}       color="text-blue-400"    icon="💡" />

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">🎯 Career Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {insights.careers?.map((c, i) => (
                <span key={i} className="badge-chip text-primary-300 border-primary-500/20 text-xs">{c}</span>
              ))}
            </div>
            <p className="text-zinc-600 text-xs mt-4 leading-relaxed">
              These careers align with your natural tendencies. Consider them as starting points for exploration.
            </p>
          </div>
        </div>
      )}

      {/* ── Trait change summary ─────────────────────── */}
      {trend?.trend && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">📈 Overall Trait Changes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(trend.trend).map(([trait, t]) => (
              <div key={trait} className="text-center p-4 bg-zinc-900/60 rounded-xl">
                <span className="text-2xl block mb-1">{TRAIT_CONFIG[trait]?.icon}</span>
                <p className="text-xs text-zinc-400 capitalize mb-1">{trait.replace('_', ' ')}</p>
                <p className={`text-lg font-bold font-mono ${
                  t.direction === 'up'   ? 'text-emerald-400' :
                  t.direction === 'down' ? 'text-red-400'     : 'text-zinc-400'
                }`}>
                  {t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '→'}
                  {' '}{Math.abs(t.change)}
                </p>
                <p className="text-xs text-zinc-600">{t.percentage > 0 ? '+' : ''}{t.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
