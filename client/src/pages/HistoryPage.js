import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { TRAIT_CONFIG, formatDate, formatRelativeTime } from '../utils/helpers';

export default function HistoryPage() {
  const [results, setResults]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/quiz/history?page=${page}&limit=8`)
      .then(r => {
        setResults(r.data.results);
        setPagination(r.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Quiz History</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {pagination.total
              ? `${pagination.total} assessment${pagination.total !== 1 ? 's' : ''} taken`
              : 'All your personality assessments over time'}
          </p>
        </div>
        <Link to="/quiz" className="btn-primary text-sm px-5 py-2.5">
          + New Quiz
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">◈</p>
          <h2 className="font-display text-2xl text-white mb-2">No quizzes yet</h2>
          <p className="text-zinc-400 mb-6 text-sm">Take your first assessment to start tracking your growth.</p>
          <Link to="/quiz" className="btn-primary px-10 py-3">Take First Quiz →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, idx) => {
            const quizNumber = pagination.total - ((page - 1) * pagination.limit) - idx;

            return (
              <Link
                key={result._id}
                to={`/quiz/result/${result._id}`}
                className="glass-hover rounded-2xl p-6 block"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Left: type + date */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-700 to-purple-700 flex items-center justify-center text-xl flex-shrink-0 shadow-lg shadow-primary-500/20">
                      {result.personalityType?.split(' ')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-zinc-200">
                          {result.personalityType?.split(' ').slice(1).join(' ')}
                        </p>
                        <span className="badge-chip text-xs">
                          #{quizNumber}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {formatDate(result.completedAt)} · {formatRelativeTime(result.completedAt)}
                      </p>
                      <p className="text-xs text-zinc-600 capitalize mt-0.5">
                        Dominant: {result.dominantTrait?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Right: trait mini bars */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {Object.keys(TRAIT_CONFIG).map(trait => (
                      <div key={trait} className="flex items-center gap-2">
                        <span
                          className="text-xs w-4 text-center flex-shrink-0"
                          title={TRAIT_CONFIG[trait].label}
                        >
                          {TRAIT_CONFIG[trait].icon}
                        </span>
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${result.scores[trait] || 0}%`,
                              backgroundColor: TRAIT_CONFIG[trait].color
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-mono w-7 text-right flex-shrink-0"
                          style={{ color: TRAIT_CONFIG[trait].color }}
                        >
                          {result.scores[trait]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="btn-outline px-6 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-zinc-400 text-sm font-mono">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="btn-outline px-6 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
