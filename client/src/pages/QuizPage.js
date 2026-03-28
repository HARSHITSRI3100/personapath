import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS = {
  extraversion:        'Extraversion',
  agreeableness:       'Agreeableness',
  conscientiousness:   'Conscientiousness',
  emotional_stability: 'Emotional Stability',
  openness:            'Openness'
};

const CATEGORY_COLORS = {
  extraversion:        '#818cf8',
  agreeableness:       '#34d399',
  conscientiousness:   '#fbbf24',
  emotional_stability: '#f87171',
  openness:            '#c084fc',
};

export default function QuizPage() {
  const navigate = useNavigate();
  const { updateLocalUser } = useAuth();

  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});   // { questionId: selectedValue }
  const [current, setCurrent]       = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/quiz/questions')
      .then(r => setQuestions(r.data.questions))
      .catch(() => toast.error('Failed to load quiz questions. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const q        = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const answered = Object.keys(answers).length;
  const remaining = questions.length - answered;

  const select = (value) => {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  };

  const goNext = () => {
    if (!answers[q.id]) return toast.error('Please select an answer before continuing');
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  // Jump to specific question from overview
  const goTo = (index) => setCurrent(index);

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      // Jump to first unanswered
      const firstUnansweredIdx = questions.findIndex(q => !answers[q.id]);
      setCurrent(firstUnansweredIdx);
      return toast.error(`${unanswered.length} question${unanswered.length > 1 ? 's' : ''} remaining`);
    }

    const responses = questions.map(q => ({
      questionId:     q.id,
      questionText:   q.text,
      category:       q.category,
      selectedOption: answers[q.id],
      isReversed:     q.isReversed || false,
    }));

    setSubmitting(true);
    try {
      const { data } = await api.post('/quiz/submit', { responses });

      // Update user badge count in local context
      if (data.updatedUser) updateLocalUser(data.updatedUser);

      // Toast each new badge
      if (data.newBadges?.length > 0) {
        data.newBadges.forEach(b =>
          toast.success(`🏆 Badge unlocked: ${b.icon} ${b.name}!`, { duration: 4000 })
        );
      }

      navigate(`/quiz/result/${data.result.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-4">
          <div className="shimmer h-4 rounded-full" />
          <div className="shimmer h-48 rounded-2xl" />
          <div className="shimmer h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!q) return null;

  const traitColor = CATEGORY_COLORS[q.category] || '#818cf8';

  return (
    <div className="min-h-full bg-surface-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* ── Progress bar ─────────────────────────────── */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-zinc-400 font-mono">
              {current + 1} / {questions.length}
            </span>
            <span className="text-zinc-500">
              {remaining > 0 ? `${remaining} remaining` : '✓ All answered'}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #6366f1, #a855f7)`
              }}
            />
          </div>

          {/* Category tag */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="badge-chip text-xs"
              style={{ color: traitColor, borderColor: traitColor + '40' }}
            >
              {CATEGORY_LABELS[q.category] || q.category}
            </span>
            {answers[q.id] && (
              <span className="text-xs text-emerald-400 font-medium">✓ Answered</span>
            )}
          </div>
        </div>

        {/* ── Question card ─────────────────────────────── */}
        <div key={q.id} className="glass rounded-3xl p-8 mb-6 animate-scale-in">
          <h2 className="font-display text-2xl sm:text-3xl text-white leading-snug mb-8">
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const value    = i + 1;
              const selected = answers[q.id] === value;

              return (
                <button
                  key={i}
                  onClick={() => select(value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-4 ${
                    selected
                      ? 'border-primary-500 bg-primary-600/20 text-white shadow-lg shadow-primary-500/15'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/70'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0 border transition-all ${
                      selected
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'border-zinc-600 text-zinc-500'
                    }`}
                  >
                    {value}
                  </span>
                  <span>{opt}</span>

                  {selected && (
                    <span className="ml-auto text-primary-400 flex-shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────── */}
        <div className="flex items-center gap-3">
          {current > 0 && (
            <button onClick={goPrev} className="btn-outline px-5 py-3 text-sm">
              ← Back
            </button>
          )}

          <div className="flex-1" />

          {current < questions.length - 1 ? (
            <button onClick={goNext} className="btn-primary px-8 py-3 text-sm">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-8 py-3 text-sm"
              style={{ boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing your profile…
                </span>
              ) : '✨ Get My Results'}
            </button>
          )}
        </div>

        {/* ── Question dot overview ─────────────────────── */}
        <div className="mt-8 flex flex-wrap gap-1.5 justify-center">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => goTo(i)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                i === current
                  ? 'bg-primary-500 scale-125'
                  : answers[qq.id]
                  ? 'bg-emerald-500/70 hover:bg-emerald-400'
                  : 'bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`Question ${i + 1}${answers[qq.id] ? ' (answered)' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
