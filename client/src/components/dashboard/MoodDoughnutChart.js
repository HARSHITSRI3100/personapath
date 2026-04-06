import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MOOD_CONFIG } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MoodDoughnutChart({ moodDistribution }) {
  if (!moodDistribution || Object.keys(moodDistribution).length === 0) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-zinc-500 text-sm">Write some journal entries to see your mood chart.</p>
      </div>
    );
  }

  const moods  = Object.keys(moodDistribution);
  const counts = moods.map(m => moodDistribution[m]);
  const colors = moods.map(m => MOOD_CONFIG[m]?.color || '#71717a');
  const labels = moods.map(m => `${MOOD_CONFIG[m]?.emoji || ''} ${MOOD_CONFIG[m]?.label || m}`);

  const data = {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: colors.map(c => c + 'cc'),
      borderColor:     colors,
      borderWidth: 2,
      hoverOffset: 6,
    }]
  };

  const options = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a1a1aa',
          usePointStyle: true,
          font: { size: 11, family: 'Sora' },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#27272a',
        borderColor: '#3f3f46',
        borderWidth: 1,
        titleColor: '#f4f4f5',
        bodyColor: '#a1a1aa',
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Mood Distribution</h3>
      <div className="max-w-xs mx-auto" style={{ height: 220 }}>
        <Doughnut data={data} options={{ ...options, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
