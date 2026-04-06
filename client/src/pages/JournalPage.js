import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MOOD_CONFIG, formatRelativeTime, TRAIT_CONFIG } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const MOODS = Object.entries(MOOD_CONFIG);

export default function JournalPage() {
  const { updateLocalUser } = useAuth();

  const [entries, setEntries]   = useState([]);
  const [selected, setSelected] = useState(null); // expanded entry
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', mood: 'neutral', tags: ''
  });

  useEffect(() => {
    api.get('/journal')
      .then(r => setEntries(r.data.entries))
      .catch(() => toast.error('Failed to load journal entries'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())   return toast.error('Please add a title');
    if (!form.content.trim()) return toast.error('Please write some content');

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    setSaving(true);
    try {
      const { data } = await api.post('/journal', { ...form, tags });
      setEntries(prev => [data.entry, ...prev]);
      setForm({ title: '', content: '', mood: 'neutral', tags: '' });
      setSelected(data.entry);
      toast.success('Entry saved & AI-analysed! 📔');
      updateLocalUser({ totalJournals: entries.length + 1 });

      if (data.newBadges?.length > 0) {
        data.newBadges.forEach(b =>
          toast.success(`🏆 Badge: ${b.icon} ${b.name}`, { duration: 4000 })
        );
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
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  // Sentiment colour helper
  const sentimentColor = (s) => {
    if (s > 0.25)  return '#34d399';
    if (s < -0.25) return '#f87171';
    return '#94a3b8';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Journal</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Write freely – AI analyses mood and personality signals automatically
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Write panel ─────────────────────────────── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4 lg:sticky lg:top-6">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span>✍️</span> New Entry
            </h2>

            <input
              className="input"
              placeholder="Title…"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              maxLength={120}
            />

            <textarea
              className="input resize-none"
              rows={7}
              placeholder="What's on your mind today? Write freely…"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
              maxLength={5000}
            />

            <div>
              <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Current Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(([key, m]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setForm({ ...form, mood: key })}
                    className={`text-xl rounded-xl px-3 py-2 border transition-all duration-200 ${
                      form.mood === key
                        ? 'border-primary-500 bg-primary-600/20 scale-110'
                        : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Selected: {MOOD_CONFIG[form.mood]?.emoji} {MOOD_CONFIG[form.mood]?.label}
              </p>
            </div>

            <input
              className="input text-sm"
              placeholder="Tags (comma-separated): work, reflection, goals…"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />

            <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
              <span>{form.content.length}/5000 chars</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                AI analysis on save
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3 text-sm"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving & Analysing…
                </span>
              ) : '✨ Save Entry'}
            </button>
          </form>
        </div>

        {/* ── Entry list ───────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)
          ) : entries.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-5xl mb-3">📔</p>
              <h3 className="font-display text-xl text-white mb-2">Your journal awaits</h3>
              <p className="text-zinc-400 text-sm">Write your first entry using the form on the left.</p>
            </div>
          ) : (
            entries.map(entry => {
              const isOpen = selected?._id === entry._id;
              return (
                <div
                  key={entry._id}
                  onClick={() => setSelected(isOpen ? null : entry)}
                  className={`glass-hover rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                    isOpen ? 'border-primary-500/40 bg-primary-600/5' : ''
                  }`}
                >
                  {/* Entry header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">
                        {MOOD_CONFIG[entry.mood]?.emoji || '😐'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-200 truncate">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-zinc-500 text-xs">{formatRelativeTime(entry.createdAt)}</p>
                          {entry.tags?.length > 0 && (
                            <div className="flex gap-1">
                              {entry.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Sentiment indicator */}
                      {entry.aiAnalysis?.sentiment !== undefined && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sentimentColor(entry.aiAnalysis.sentiment) }}
                          title={`Sentiment score: ${entry.aiAnalysis.sentiment}`}
                        />
                      )}
                      <span className="text-zinc-400 text-sm">{isOpen ? '↑' : '↓'}</span>
                      <button
                        onClick={e => handleDelete(entry._id, e)}
                        className="text-zinc-600 hover:text-red-400 text-sm transition-colors ml-1"
                        title="Delete entry"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {isOpen && (
                    <div className="mt-5 pt-5 border-t border-zinc-700/50 animate-fade-in space-y-5">
                      {/* Content */}
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>

                      {/* AI Analysis panel */}
                      {entry.aiAnalysis && entry.isAnalyzed && (
                        <div className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-primary-400 text-sm">🤖</span>
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                              AI Analysis
                            </p>
                            {/* Sentiment meter */}
                            <div className="ml-auto flex items-center gap-1.5">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: sentimentColor(entry.aiAnalysis.sentiment) }}
                              />
                              <span className="text-xs text-zinc-500">
                                {entry.aiAnalysis.sentiment > 0.25 ? 'Positive'
                                  : entry.aiAnalysis.sentiment < -0.25 ? 'Negative'
                                  : 'Neutral'} tone
                              </span>
                            </div>
                          </div>

                          {entry.aiAnalysis.summary && (
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {entry.aiAnalysis.summary}
                            </p>
                          )}

                          {/* Trait signals */}
                          {entry.aiAnalysis.traitSignals && (
                            <div>
                              <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wide">Trait Signals Detected</p>
                              <div className="space-y-1.5">
                                {Object.entries(entry.aiAnalysis.traitSignals)
                                  .filter(([, v]) => v > 0)
                                  .sort(([, a], [, b]) => b - a)
                                  .map(([trait, val]) => (
                                    <div key={trait} className="flex items-center gap-2">
                                      <span className="text-sm w-4 text-center">
                                        {TRAIT_CONFIG[trait]?.icon}
                                      </span>
                                      <span className="text-xs text-zinc-400 w-32 capitalize truncate">
                                        {trait.replace('_', ' ')}
                                      </span>
                                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${val * 100}%`,
                                            backgroundColor: TRAIT_CONFIG[trait]?.color || '#818cf8'
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Suggestions */}
                          {entry.aiAnalysis.suggestions?.length > 0 && (
                            <div>
                              <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wide">Suggestions</p>
                              <ul className="space-y-1.5">
                                {entry.aiAnalysis.suggestions.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-primary-300">
                                    <span className="mt-0.5 flex-shrink-0">→</span>
                                    <span className="text-zinc-300">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Keywords */}
                          {entry.aiAnalysis.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {entry.aiAnalysis.keywords.map((k, i) => (
                                <span key={i} className="badge-chip text-xs">{k}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
