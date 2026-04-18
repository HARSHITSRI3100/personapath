import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MOOD_CONFIG, formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const MOODS = Object.entries(MOOD_CONFIG);

function AIInsightsPanel({ analysis, loading, onAnalyze, content }) {
  if (loading) {
    return (
      <div className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Gemini reading entry…</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-3 bg-zinc-800 rounded shimmer" style={{ width: `${65 + i * 12}%` }} />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-zinc-600 text-xs mb-3">Gemini can analyse mood, sentiment & insights</p>
        <button
          onClick={onAnalyze}
          disabled={!content || content.length < 20}
          className="btn-outline text-xs px-4 py-2 disabled:opacity-40"
        >
          ✦ Run AI Analysis
        </button>
      </div>
    );
  }

  const sc = analysis.sentimentScore;
  const sentColor = sc > 60 ? '#34d399' : sc < 40 ? '#f87171' : '#94a3b8';
  const sentLabel = sc >= 70 ? 'Very Positive' : sc >= 55 ? 'Positive' : sc >= 45 ? 'Neutral' : sc >= 30 ? 'Negative' : 'Very Negative';

  return (
    <div className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex-1">Gemini Analysis</p>
        <button onClick={onAnalyze} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">↺ refresh</button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-zinc-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Mood</p>
          <p className="font-semibold text-white capitalize text-sm">{analysis.mood}</p>
          {analysis.emotionalTone && <p className="text-xs text-zinc-500 mt-0.5 truncate">{analysis.emotionalTone}</p>}
        </div>
        <div className="flex-1 bg-zinc-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Sentiment</p>
          <p className="font-bold font-mono text-sm" style={{ color: sentColor }}>{sc}/100</p>
          <p className="text-xs" style={{ color: sentColor }}>{sentLabel}</p>
        </div>
      </div>

      <div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${sc}%`, background: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399)' }} />
        </div>
      </div>

      {analysis.affirmation && (
        <div className="bg-primary-900/20 border border-primary-500/20 rounded-lg p-3">
          <p className="text-primary-300 text-xs leading-relaxed italic">"{analysis.affirmation}"</p>
        </div>
      )}

      {analysis.insights?.length > 0 && (
        <div>
          <p className="text-xs text-zinc-600 mb-1.5 uppercase tracking-wide font-medium">Insights</p>
          <ul className="space-y-1.5">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="text-primary-400 mt-0.5 flex-shrink-0">✦</span>{insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.suggestions?.length > 0 && (
        <div>
          <p className="text-xs text-zinc-600 mb-1.5 uppercase tracking-wide font-medium">Suggestions</p>
          <ul className="space-y-1.5">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">→</span>
                <span className="text-zinc-300">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.keyThemes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {analysis.keyThemes.map((t, i) => (
            <span key={i} className="badge-chip text-xs">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const { updateLocalUser } = useAuth();
  const [entries, setEntries]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);
  const [liveAI, setLiveAI]         = useState(null);
  const [form, setForm] = useState({ title: '', content: '', mood: 'neutral', tags: '' });

  useEffect(() => {
    api.get('/journal')
      .then(r => setEntries(r.data.entries))
      .catch(() => toast.error('Failed to load journal entries'))
      .finally(() => setLoading(false));
  }, []);

  const runLiveAnalysis = async () => {
    if (form.content.trim().length < 20) return toast.error('Write at least 20 characters first');
    setAiLoading(true);
    setLiveAI(null);
    try {
      const { data } = await api.post('/ai/journal', { content: form.content });
      setLiveAI(data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const runEntryAnalysis = async (entry) => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/journal', { content: entry.content, journalId: entry._id });
      const updated = { ...entry, aiAnalysis: { ...entry.aiAnalysis, ...data.analysis, isAiAnalyzed: true } };
      setEntries(prev => prev.map(e => e._id === entry._id ? updated : e));
      if (selected?._id === entry._id) setSelected(updated);
      toast.success('AI analysis updated! ✦');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please add a title');
    if (!form.content.trim()) return toast.error('Please write some content');
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      const { data } = await api.post('/journal', { ...form, tags });
      setEntries(prev => [data.entry, ...prev]);
      setForm({ title: '', content: '', mood: 'neutral', tags: '' });
      setLiveAI(null);
      setSelected(data.entry);
      toast.success('Entry saved! 📔');
      updateLocalUser({ totalJournals: entries.length + 1 });
      if (data.newBadges?.length > 0) {
        data.newBadges.forEach(b => toast.success(`🏆 ${b.icon} ${b.name}`, { duration: 4000 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete entry'); }
  };

  const sentimentColor = (s) => s > 0.25 ? '#34d399' : s < -0.25 ? '#f87171' : '#94a3b8';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Journal</h1>
        <p className="text-zinc-400 text-sm mt-1">Write freely — Gemini analyses mood, sentiment & personality signals</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Write panel */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4 lg:sticky lg:top-6">
            <h2 className="font-semibold text-white flex items-center gap-2"><span>✍️</span> New Entry</h2>
            <input className="input" placeholder="Title…" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={120} />
            <textarea className="input resize-none" rows={7} placeholder="What's on your mind today?" value={form.content}
              onChange={e => { setForm({ ...form, content: e.target.value }); setLiveAI(null); }}
              required maxLength={5000} />
            <div>
              <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Current Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(([key, m]) => (
                  <button type="button" key={key} onClick={() => setForm({ ...form, mood: key })}
                    className={`text-xl rounded-xl px-3 py-2 border transition-all duration-200 ${
                      form.mood === key ? 'border-primary-500 bg-primary-600/20 scale-110' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                    }`} title={m.label}>{m.emoji}
                  </button>
                ))}
              </div>
            </div>
            <input className="input text-sm" placeholder="Tags (comma-separated)…" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })} />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>{form.content.length}/5000</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />AI on save
              </span>
            </div>
            <AIInsightsPanel analysis={liveAI} loading={aiLoading && !selected} onAnalyze={runLiveAnalysis} content={form.content} />
            <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm">
              {saving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : '✨ Save Entry'}
            </button>
          </form>
        </div>

        {/* Entry list */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />) :
           entries.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-5xl mb-3">📔</p>
              <h3 className="font-display text-xl text-white mb-2">Your journal awaits</h3>
              <p className="text-zinc-400 text-sm">Write your first entry using the form on the left.</p>
            </div>
          ) : entries.map(entry => {
            const isOpen = selected?._id === entry._id;
            return (
              <div key={entry._id} onClick={() => setSelected(isOpen ? null : entry)}
                className={`glass-hover rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isOpen ? 'border-primary-500/40 bg-primary-600/5' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl flex-shrink-0">{MOOD_CONFIG[entry.mood]?.emoji || '😐'}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-200 truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-zinc-500 text-xs">{formatRelativeTime(entry.createdAt)}</p>
                        {entry.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {entry.tags.slice(0, 2).map(t => (
                              <span key={t} className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry.aiAnalysis?.isAiAnalyzed && <span className="text-xs text-primary-400 font-medium">✦ AI</span>}
                    {entry.aiAnalysis?.sentiment !== undefined && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColor(entry.aiAnalysis.sentiment) }} />
                    )}
                    <span className="text-zinc-400 text-sm">{isOpen ? '↑' : '↓'}</span>
                    <button onClick={e => handleDelete(entry._id, e)} className="text-zinc-600 hover:text-red-400 text-sm transition-colors ml-1">✕</button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-zinc-700/50 animate-fade-in space-y-5">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{entry.content}</p>
                    <AIInsightsPanel
                      analysis={entry.aiAnalysis?.isAiAnalyzed ? {
                        mood: entry.aiAnalysis?.aiMood || entry.mood,
                        sentimentScore: entry.aiAnalysis?.sentimentScore,
                        emotionalTone: entry.aiAnalysis?.emotionalTone,
                        insights: entry.aiAnalysis?.insights,
                        suggestions: entry.aiAnalysis?.suggestions,
                        keyThemes: entry.aiAnalysis?.keyThemes,
                        affirmation: entry.aiAnalysis?.affirmation,
                      } : null}
                      loading={aiLoading && selected?._id === entry._id}
                      onAnalyze={() => runEntryAnalysis(entry)}
                      content={entry.content}
                    />
                    {!entry.aiAnalysis?.isAiAnalyzed && entry.isAnalyzed && entry.aiAnalysis?.summary && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Basic Analysis</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{entry.aiAnalysis.summary}</p>
                        {entry.aiAnalysis.suggestions?.map((s, i) => (
                          <p key={i} className="text-xs text-primary-300 mt-1.5">→ {s}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
