// Trait display configuration
export const TRAIT_CONFIG = {
  extraversion: {
    label: 'Extraversion',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.3)',
    icon: '🗣️',
    description: 'How outgoing and socially energetic you are'
  },
  agreeableness: {
    label: 'Agreeableness',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
    icon: '🤝',
    description: 'Your cooperative and empathetic tendencies'
  },
  conscientiousness: {
    label: 'Conscientiousness',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.3)',
    icon: '🎯',
    description: 'Your organisation, discipline, and reliability'
  },
  emotional_stability: {
    label: 'Emotional Stability',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.3)',
    icon: '⚖️',
    description: 'Your resilience and emotional regulation'
  },
  openness: {
    label: 'Openness',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.3)',
    icon: '✨',
    description: 'Your curiosity, creativity, and imagination'
  }
};

export const MOOD_CONFIG = {
  ecstatic: { label: 'Ecstatic',  emoji: '🤩', color: '#fbbf24' },
  happy:    { label: 'Happy',     emoji: '😊', color: '#34d399' },
  neutral:  { label: 'Neutral',   emoji: '😐', color: '#94a3b8' },
  sad:      { label: 'Sad',       emoji: '😔', color: '#60a5fa' },
  anxious:  { label: 'Anxious',   emoji: '😰', color: '#fb923c' },
  angry:    { label: 'Angry',     emoji: '😤', color: '#f87171' },
};

// Format a score (0-100) to a descriptive level
export const getScoreLevel = (score) => {
  if (score >= 75) return { label: 'Very High', color: 'text-emerald-400' };
  if (score >= 55) return { label: 'High',      color: 'text-green-400' };
  if (score >= 45) return { label: 'Moderate',  color: 'text-yellow-400' };
  if (score >= 30) return { label: 'Low',        color: 'text-orange-400' };
  return                   { label: 'Very Low',  color: 'text-red-400' };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 7)     return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
