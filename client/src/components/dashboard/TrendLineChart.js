import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TRAIT_CONFIG } from '../../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrendLineChart({ chartData }) {
  if (!chartData || chartData.length < 2) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-zinc-500 text-sm">Take at least 2 quizzes to see your growth trend.</p>
      </div>
    );
  }

  const labels = chartData.map(d => d.label || `Quiz ${d.attempt}`);
  const traits  = Object.keys(TRAIT_CONFIG);

  const datasets = traits.map(trait => ({
    label:           TRAIT_CONFIG[trait].label,
    data:            chartData.map(d => d[trait] ?? 0),
    borderColor:     TRAIT_CONFIG[trait].color,
    backgroundColor: TRAIT_CONFIG[trait].color + '18',
    borderWidth:     2,
    pointBackgroundColor: TRAIT_CONFIG[trait].color,
    pointBorderColor: '#18181b',
    pointBorderWidth: 2,
    pointRadius:     4,
    tension:         0.4,
    fill:            false,
  }));

  const data    = { labels, datasets };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#a1a1aa',
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 11, family: 'Sora' },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#27272a',
        borderColor: '#3f3f46',
        borderWidth: 1,
        titleColor: '#f4f4f5',
        bodyColor: '#a1a1aa',
        padding: 12,
      }
    },
    scales: {
      x: {
        grid:   { color: 'rgba(255,255,255,0.04)' },
        ticks:  { color: '#71717a', font: { size: 11, family: 'Sora' } }
      },
      y: {
        min: 0, max: 100,
        grid:   { color: 'rgba(255,255,255,0.04)' },
        ticks:  { color: '#71717a', font: { size: 11, family: 'JetBrains Mono' }, stepSize: 25 }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Growth Over Time</h3>
      <div style={{ height: 260 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
