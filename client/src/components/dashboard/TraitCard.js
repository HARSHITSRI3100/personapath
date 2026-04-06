import React from 'react';
import { TRAIT_CONFIG, getScoreLevel } from '../../utils/helpers';

/**
 * Renders a single personality trait bar card.
 * @param {string} trait  - trait key e.g. 'extraversion'
 * @param {number} score  - 0–100
 * @param {boolean} animated - whether to animate on mount
 */
export default function TraitCard({ trait, score, animated = true }) {
  const config = TRAIT_CONFIG[trait];
  const level  = getScoreLevel(score);
  if (!config) return null;

  return (
    <div
      className="glass rounded-2xl p-5 transition-all duration-300 hover:border-opacity-50"
      style={{ borderColor: config.border }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <p className="font-semibold text-zinc-200 text-sm">{config.label}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{config.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span
            className="font-mono font-bold text-xl"
            style={{ color: config.color }}
          >
            {score}
          </span>
          <p className={`text-xs font-medium ${level.color}`}>{level.label}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mt-2">
        <div
          className="progress-fill"
          style={{
            '--trait-color': config.color,
            width: animated ? `${score}%` : `${score}%`,
            transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none'
          }}
        />
      </div>
    </div>
  );
}
