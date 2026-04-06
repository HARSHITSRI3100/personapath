import React from 'react';
import { formatDate } from '../../utils/helpers';

export default function BadgeGrid({ badges = [] }) {
  if (badges.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-4xl mb-2">🏆</p>
        <p className="text-zinc-400 text-sm">Complete quizzes and journal entries to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="glass-hover rounded-xl p-4 text-center cursor-default"
            title={badge.description}
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <p className="text-xs font-semibold text-zinc-200 leading-tight">{badge.name}</p>
            {badge.earnedAt && (
              <p className="text-zinc-600 text-xs mt-1">{formatDate(badge.earnedAt)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
