import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { TRAIT_CONFIG } from '../utils/helpers';
import RadarChart from '../components/dashboard/RadarChart';
import TraitCard from '../components/dashboard/TraitCard';

// ── Sub-components ───────────────────────────────────────────

function InsightCard({ icon, title, items, color, delay = 0 }) {
  return (
    <div
      className="glass rounded-2xl p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
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

function CareerBadge({ career }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                     bg-gradient-to-r from-primary-900/60 to-purple-900/60
                     border border-primary-500/30 text-primary-300
                     hover:border-primary-400/60 hover:text-primary-200 transition-all duration-200">
      {career}
    </span>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 mx-auto mb-4 shimmer" />
        <div className="h-8 bg-zinc-800 rounded-xl w-64 mx-auto mb-3 shimmer" />
        <div className="h-4 bg-zinc-800 rounded w-96 mx-auto shimmer" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 h-48 shimmer" />
        ))}
      </div>
    </div>
  );
}

function AIThinkingLoader() {
  const steps = [
    'Reading your personality profile…',
    'Mapping trait combinations…',
    'Generating career pathways…',
    'Crafting your personal summary…',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
  const interval = setInterval(() => {
    setStep(s => (s + 1) % steps.length);
  }, 1800);
  return () => clearInterval(interval);
}, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Animated brain */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 opacity-20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 opacity-40 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
          <span className="text-xl">🧠</span>
        </div>
      </div>

      {/* Thinking dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <p className="text-zinc-400 text-sm font-medium transition-all duration-500">
        {steps[step]}
      </p>
      <p className="text-zinc-600 text-xs">Groq AI is analysing your Big Five profile</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AIInsightsPage() {
  const [quizData, setQuizData]     = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [loadingAI, setLoadingAI]   = useState(false);
  const [aiError, setAiError]       = useState(null);

  // Load latest quiz scores
  useEffect(() => {
    api.get('/analysis/latest')
      .then(r => setQuizData(r.data))
      .catch(() => setQuizData(null))
      .finally(() => setLoadingQuiz(false));
  }, []);

  const runAIAnalysis = async () => {
    if (!quizData) return;
    setLoadingAI(true);
    setAiError(null);
    setAiResult(null);
    try {
      const { data } = await api.post('/ai/personality', {
        scores: quizData.scores,
        personalityType: quizData.personalityType,
        dominantTrait: quizData.dominantTrait,
      });
      setAiResult(data.analysis);
      toast.success('AI analysis complete! 🧠');
    } catch (err) {
      const msg = err.response?.data?.error || 'AI analysis failed. Please try again.';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loadingQuiz) return <SkeletonLoader />;

  if (!quizData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center py-24">
        <p className="text-6xl mb-4">🧠</p>
        <h2 className="font-display text-2xl text-white mb-3">No quiz data found</h2>
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          Take the personality quiz first to unlock your Groq AI deep-dive analysis.
        </p>
        <Link to="/quiz" className="btn-primary px-10 py-3.5">Take Quiz Now →</Link>
      </div>
    );
  }

  const { scores, personalityType, dominantTrait } = quizData;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl text-white">AI Deep Analysis</h1>
            <span className="badge-chip text-xs text-emerald-400 border-emerald-500/30">
              ✦ Groq AI Powered
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Real AI analysis of your Big Five personality profile
          </p>
        </div>
        <Link to="/quiz" className="btn-outline text-sm px-5 py-2.5 flex-shrink-0">
          Retake Quiz ↺
        </Link>
      </div>

      {/* ── Personality Type Hero ─────────────────────── */}
      <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 glow-indigo pointer-events-none" />
        <div className="absolute inset-0 glow-purple pointer-events-none" />
        <div className="relative z-10">
          <p className="text-7xl mb-4">{personalityType?.split(' ')[0]}</p>
          <h2 className="font-display text-4xl text-white mb-3">
            {personalityType?.split(' ').slice(1).join(' ')}
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Dominant trait:{' '}
            <span className="text-primary-300 font-semibold capitalize">
              {dominantTrait?.replace('_', ' ')}
            </span>
          </p>

          {/* Trait score pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(scores).map(([trait, score]) => (
              <span
                key={trait}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border"
                style={{
                  color: TRAIT_CONFIG[trait]?.color,
                  borderColor: TRAIT_CONFIG[trait]?.color + '40',
                  backgroundColor: TRAIT_CONFIG[trait]?.color + '10',
                }}
              >
                {TRAIT_CONFIG[trait]?.icon} {trait.replace('_', ' ')} {score}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RadarChart scores={scores} title="Personality Radar" />
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Trait Scores</h3>
          {Object.keys(TRAIT_CONFIG).map(trait => (
            <TraitCard key={trait} trait={trait} score={scores[trait]} />
          ))}
        </div>
      </div>

      {/* ── AI Analysis CTA / Result ─────────────────── */}
      {!aiResult && !loadingAI && (
        <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-purple-900/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/30">
              <span className="text-2xl">✦</span>
            </div>
            <h2 className="font-display text-2xl text-white mb-3">
              Run Groq AI Deep Analysis
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Get a personalized, AI-written summary of your personality, unique to your
              exact trait combination — beyond what rule-based systems can offer.
            </p>

            {aiError && (
              <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-sm max-w-md mx-auto">
                {aiError}
              </div>
            )}

            <button onClick={runAIAnalysis} className="btn-primary px-10 py-4 text-base">
              ✦ Generate My AI Analysis
            </button>
            <p className="text-zinc-600 text-xs mt-4">
              Powered by Groq AI · Takes ~5 seconds
            </p>
          </div>
        </div>
      )}

      {/* ── AI Thinking State ────────────────────────── */}
      {loadingAI && (
        <div className="glass rounded-3xl overflow-hidden">
          <AIThinkingLoader />
        </div>
      )}

      {/* ── AI Results ───────────────────────────────── */}
      {aiResult && (
        <div className="space-y-6 animate-fade-in">

          {/* Summary */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-500 font-medium">Groq AI</span>
            </div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-primary-400">✦</span> Your Personality Summary
            </h3>
            <p className="text-zinc-200 leading-relaxed text-base">{aiResult.summary}</p>
          </div>

          {/* Insights grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <InsightCard
              icon="💪" title="Core Strengths"
              items={aiResult.strengths} color="text-emerald-400" delay={0}
            />
            <InsightCard
              icon="🌱" title="Growth Areas"
              items={aiResult.weaknesses} color="text-amber-400" delay={100}
            />
            <InsightCard
              icon="💡" title="Growth Tips"
              items={aiResult.growthTips} color="text-blue-400" delay={200}
            />

            {/* Careers */}
            <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Best Career Matches
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {aiResult.careerSuggestions?.map((c, i) => (
                  <CareerBadge key={i} career={c} />
                ))}
              </div>
              <p className="text-zinc-600 text-xs mt-3 leading-relaxed">
                AI-matched based on your unique trait combination — not generic suggestions.
              </p>
            </div>
          </div>

          {/* Compatible types */}
          {aiResult.compatibleTypes?.length > 0 && (
            <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🤝</span> Compatible Personality Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiResult.compatibleTypes.map((t, i) => (
                  <span key={i} className="badge-chip text-sm">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Re-run */}
          <div className="text-center pt-2">
            <button
              onClick={runAIAnalysis}
              disabled={loadingAI}
              className="btn-outline px-8 py-3 text-sm"
            >
              ↺ Regenerate Analysis
            </button>
            <p className="text-zinc-600 text-xs mt-2">Each generation is unique</p>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/chat" className="btn-primary flex-1 py-3 text-sm text-center">
          💬 Career Coach Chat →
        </Link>
        <Link to="/journal" className="btn-outline flex-1 py-3 text-sm text-center">
          📔 Write in Journal →
        </Link>
      </div>
    </div>
  );
}
