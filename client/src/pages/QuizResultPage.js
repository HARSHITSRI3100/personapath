import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import TraitCard from '../components/dashboard/TraitCard';
import RadarChart from '../components/dashboard/RadarChart';
import { TRAIT_CONFIG, formatDate } from '../utils/helpers';

function InsightSection({ title, items, color }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
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

export default function QuizResultPage() {
  const { id } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api.get(`/quiz/${id}`)
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="shimmer h-48 rounded-3xl" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Result not found.</p>
        <Link to="/history" className="btn-outline mt-4 inline-block px-6 py-2.5 text-sm">← View History</Link>
      </div>
    );
  }

  const { result, insights } = data;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">

      {/* ── Personality hero ─────────────────────────── */}
      <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 glow-indigo pointer-events-none" />
        <div className="absolute inset-0 glow-purple pointer-events-none" />
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-scale-in">{result.personalityType?.split(' ')[0]}</div>
          <div className="inline-flex items-center gap-2 badge-chip mb-4">
            ✨ Results Ready
          </div>
          <h1 className="font-display text-4xl text-white mb-2">
            {result.personalityType?.split(' ').slice(1).join(' ')}
          </h1>
          <p className="text-zinc-400 text-sm">
            Assessment completed {formatDate(result.completedAt)} ·{' '}
            Dominant trait:{' '}
            <span className="text-primary-300 capitalize font-medium">
              {result.dominantTrait?.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      {/* ── Trait scores ─────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {Object.keys(TRAIT_CONFIG).map(trait => (
          <TraitCard key={trait} trait={trait} score={result.scores[trait]} />
        ))}
      </div>

      {/* ── Radar chart ──────────────────────────────── */}
      <RadarChart scores={result.scores} title="Personality Radar" />

      {/* ── AI Insights grid ─────────────────────────── */}
      {insights && (
        <div className="grid sm:grid-cols-2 gap-6">
          <InsightSection title="💪 Your Strengths"     items={insights.strengths}  color="text-emerald-400" />
          <InsightSection title="⚠️ Growth Areas"        items={insights.weaknesses} color="text-amber-400"   />
          <InsightSection title="💡 Improvement Tips"   items={insights.tips}       color="text-blue-400"    />

          {/* Career suggestions card */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">🎯 Career Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {insights.careers?.map((c, i) => (
                <span key={i} className="badge-chip text-primary-300 border-primary-500/20 text-xs">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
              Based on your personality profile, these fields tend to align well with your natural tendencies and strengths.
            </p>
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard" className="btn-outline flex-1 py-3 text-sm text-center">
          ← Dashboard
        </Link>
        <Link to="/quiz"      className="btn-primary flex-1 py-3 text-sm text-center">
          Retake Quiz ↺
        </Link>
        <Link to="/journal"   className="btn-outline flex-1 py-3 text-sm text-center">
          Reflect in Journal →
        </Link>
      </div>
    </div>
  );
}
