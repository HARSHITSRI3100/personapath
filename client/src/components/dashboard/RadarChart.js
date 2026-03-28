import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { TRAIT_CONFIG } from '../../utils/helpers';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({ scores, title = 'Personality Profile' }) {
  if (!scores) return null;

  const labels = Object.keys(TRAIT_CONFIG).map(k => TRAIT_CONFIG[k].label);
  const values = Object.keys(TRAIT_CONFIG).map(k => scores[k] ?? 0);

  const data = {
    labels,
    datasets: [{
      label: 'Your Traits',
      data: values,
      backgroundColor: 'rgba(99,102,241,0.18)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: Object.keys(TRAIT_CONFIG).map(k => TRAIT_CONFIG[k].color),
      pointBorderColor: '#18181b',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#27272a',
        borderColor: '#3f3f46',
        borderWidth: 1,
        titleColor: '#f4f4f5',
        bodyColor: '#a1a1aa',
        padding: 12,
        callbacks: {
          label: (ctx) => ` Score: ${ctx.raw}/100`
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#52525b',
          font: { size: 10, family: 'JetBrains Mono' },
          backdropColor: 'transparent'
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: {
          color: '#a1a1aa',
          font: { size: 11, family: 'Sora', weight: '500' }
        }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">{title}</h3>
      <div className="max-w-sm mx-auto">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
