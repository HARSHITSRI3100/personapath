/**
 * ============================================================
 * PersonaPath – Personality Scoring Engine
 * ============================================================
 * Implements a Big-Five-inspired scoring algorithm with:
 *   1. Weighted trait scoring from quiz responses
 *   2. Personality type classification
 *   3. AI insight generation (strengths, weaknesses, career, tips)
 *   4. Journal sentiment & trait signal analysis
 * ============================================================
 */

// ─── Personality type archetypes ────────────────────────────
const PERSONALITY_TYPES = {
  high_extraversion_high_openness:         { name: 'The Visionary',    emoji: '🔮' },
  high_extraversion_high_conscientiousness:{ name: 'The Leader',       emoji: '👑' },
  high_extraversion_high_agreeableness:    { name: 'The Connector',    emoji: '🤝' },
  high_openness_high_conscientiousness:    { name: 'The Innovator',    emoji: '💡' },
  high_agreeableness_high_stability:       { name: 'The Harmonizer',   emoji: '🌿' },
  high_conscientiousness_high_stability:   { name: 'The Architect',    emoji: '🏛️' },
  high_openness_high_agreeableness:        { name: 'The Empath',       emoji: '💙' },
  balanced:                                { name: 'The Adaptor',      emoji: '⚖️'  },
};

// ─── Trait descriptions used in insight generation ──────────
const TRAIT_DATA = {
  extraversion: {
    high: {
      strengths: ['Natural leader who energizes teams', 'Excellent communicator and networker', 'Thrives in collaborative environments'],
      weaknesses: ['May dominate conversations', 'Can struggle with deep focus', 'Sometimes acts before thinking'],
      careers: ['Sales & Business Development', 'Public Relations', 'Teaching & Coaching', 'Entrepreneurship', 'Event Management'],
      tips: ['Practice active listening – give others space to speak', 'Schedule solo reflection time daily', 'Channel social energy into mentoring others']
    },
    low: {
      strengths: ['Deep thinker and careful analyst', 'Excellent at independent, focused work', 'Thoughtful communicator'],
      weaknesses: ['May miss networking opportunities', 'Can appear reserved in group settings', 'Social fatigue in large groups'],
      careers: ['Research & Academia', 'Software Engineering', 'Writing & Editing', 'Data Analysis', 'Architecture'],
      tips: ['Set small social goals – one new conversation per week', 'Leverage written communication as a strength', 'Find one trusted colleague to collaborate with regularly']
    }
  },
  agreeableness: {
    high: {
      strengths: ['Highly empathetic and supportive', 'Excellent team player', 'Builds trust quickly'],
      weaknesses: ['Difficulty saying no', 'May avoid necessary conflict', 'Can be taken advantage of'],
      careers: ['Counseling & Therapy', 'Social Work', 'Human Resources', 'Nursing & Healthcare', 'Non-profit Leadership'],
      tips: ['Practice assertive communication', 'Set firm personal boundaries', 'Learn to distinguish helping from people-pleasing']
    },
    low: {
      strengths: ['Direct and honest communicator', 'Strong negotiator', 'Not easily manipulated'],
      weaknesses: ['May come across as blunt', 'Can struggle with team dynamics', 'May prioritize goals over people'],
      careers: ['Law & Litigation', 'Investment Banking', 'Competitive Sales', 'Military Leadership', 'Executive Management'],
      tips: ['Practice empathy exercises', 'Ask about others\' perspectives before responding', 'Acknowledge feelings before jumping to solutions']
    }
  },
  conscientiousness: {
    high: {
      strengths: ['Highly organized and reliable', 'Strong follow-through on commitments', 'Goal-oriented and disciplined'],
      weaknesses: ['Perfectionism can cause analysis-paralysis', 'Difficulty adapting to sudden changes', 'May be overly critical of self/others'],
      careers: ['Project Management', 'Medicine & Surgery', 'Law', 'Accounting & Finance', 'Engineering'],
      tips: ['Embrace "good enough" for non-critical tasks', 'Build flexibility into plans', 'Celebrate incremental progress, not just completion']
    },
    low: {
      strengths: ['Flexible and adaptable', 'Creative and spontaneous', 'Easy-going under pressure'],
      weaknesses: ['Struggles with long-term planning', 'Procrastination tendencies', 'May miss deadlines'],
      careers: ['Creative Arts', 'Freelancing', 'Startup Environments', 'Travel & Hospitality', 'Entertainment'],
      tips: ['Use time-blocking instead of to-do lists', 'Start tasks with a 2-minute quick-start rule', 'Build accountability partnerships']
    }
  },
  emotional_stability: {
    high: {
      strengths: ['Calm under pressure', 'Resilient in face of setbacks', 'Consistent mood and temperament'],
      weaknesses: ['May underestimate emotional depth of others', 'Can appear detached', 'May dismiss valid concerns as "overreacting"'],
      careers: ['Crisis Management', 'Trauma Surgery', 'Air Traffic Control', 'Stock Trading', 'Firefighting'],
      tips: ['Develop emotional vocabulary to connect with others', 'Practice expressing appreciation openly', 'Engage with art or music to explore emotional range']
    },
    low: {
      strengths: ['Highly empathetic and emotionally aware', 'Strong intuition about others', 'Deep emotional intelligence'],
      weaknesses: ['Stress and anxiety management challenges', 'Mood variability can affect performance', 'Overthinking tendencies'],
      careers: ['Art Therapy', 'Creative Writing', 'Social Advocacy', 'Psychology', 'Music & Performing Arts'],
      tips: ['Build a daily mindfulness or meditation practice', 'Use journaling to process emotions', 'Identify and limit known stress triggers']
    }
  },
  openness: {
    high: {
      strengths: ['Innovative and creative thinker', 'Curious and eager to learn', 'Comfortable with ambiguity'],
      weaknesses: ['Can struggle to focus on one path', 'May be seen as impractical', 'Boredom with routine'],
      careers: ['Design & UX', 'Research Science', 'Philosophy & Academia', 'Creative Direction', 'Innovation Consulting'],
      tips: ['Create constraints to channel creativity productively', 'Keep an "ideas journal" to capture thoughts', 'Find a practical partner to help execute visions']
    },
    low: {
      strengths: ['Practical and grounded', 'Consistent and dependable approach', 'Strong execution skills'],
      weaknesses: ['Resistance to change', 'May miss unconventional solutions', 'Preference for proven methods'],
      careers: ['Banking & Finance', 'Manufacturing', 'Administration', 'Quality Assurance', 'Traditional Engineering'],
      tips: ['Try one new activity or approach each month', 'Ask "what if?" before dismissing new ideas', 'Read widely outside your comfort zone']
    }
  }
};

/**
 * Calculates personality trait scores from quiz responses.
 * Each question has a category and a 1-5 response value.
 * Some questions are reverse-scored (marked isReversed=true).
 * 
 * @param {Array} responses - Array of { category, selectedOption, isReversed }
 * @returns {Object} scores – normalized 0-100 per trait
 */
const calculateScores = (responses) => {
  const traitSums = {
    extraversion: [], agreeableness: [], conscientiousness: [],
    emotional_stability: [], openness: []
  };

  responses.forEach(({ category, selectedOption, isReversed }) => {
    if (!traitSums[category]) return;
    // Reverse scoring: 6 - value flips 1→5, 5→1, etc.
    const score = isReversed ? (6 - selectedOption) : selectedOption;
    traitSums[category].push(score);
  });

  const scores = {};
  Object.entries(traitSums).forEach(([trait, values]) => {
    if (values.length === 0) {
      scores[trait] = 50; // Default to midpoint if no questions
      return;
    }
    const avg = values.reduce((a, b) => a + b, 0) / values.length; // 1-5 range
    scores[trait] = Math.round(((avg - 1) / 4) * 100); // Normalize to 0-100
  });

  return scores;
};

/**
 * Determines the dominant personality trait.
 */
const getDominantTrait = (scores) => {
  return Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
};

/**
 * Classifies personality into a named archetype based on top two traits.
 */
const getPersonalityType = (scores) => {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [top1, top2] = sorted.map(([trait]) => trait);

  const key1 = `high_${top1}_high_${top2}`;
  const key2 = `high_${top2}_high_${top1}`;

  return PERSONALITY_TYPES[key1] || PERSONALITY_TYPES[key2] ||
    (sorted[0][1] > 70
      ? PERSONALITY_TYPES[`high_${top1}_high_${top2}`] || PERSONALITY_TYPES.balanced
      : PERSONALITY_TYPES.balanced);
};

/**
 * Generates AI-driven insights from personality scores.
 * Returns strengths, weaknesses, career suggestions, and improvement tips.
 * 
 * @param {Object} scores - Normalized 0-100 trait scores
 * @returns {Object} insights
 */
const generateInsights = (scores) => {
  const THRESHOLD = 55; // Above = "high", below = "low"

  const allStrengths = [];
  const allWeaknesses = [];
  const allCareers = [];
  const allTips = [];

  // Gather insights from the top 3 most pronounced traits
  const sortedTraits = Object.entries(scores)
    .map(([trait, score]) => ({ trait, score, distance: Math.abs(score - 50) }))
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 3);

  sortedTraits.forEach(({ trait, score }) => {
    const level = score >= THRESHOLD ? 'high' : 'low';
    const data = TRAIT_DATA[trait]?.[level];
    if (!data) return;

    allStrengths.push(...data.strengths);
    allWeaknesses.push(...data.weaknesses);
    allCareers.push(...data.careers);
    allTips.push(...data.tips);
  });

  // De-duplicate and limit results
  return {
    strengths:   [...new Set(allStrengths)].slice(0, 5),
    weaknesses:  [...new Set(allWeaknesses)].slice(0, 4),
    careers:     [...new Set(allCareers)].slice(0, 6),
    tips:        [...new Set(allTips)].slice(0, 5),
    personalityType: getPersonalityType(scores)
  };
};

// ─── Keyword sentiment lists for journal analysis ────────────
const POSITIVE_KEYWORDS = ['happy', 'grateful', 'excited', 'motivated', 'proud', 'calm', 'peaceful', 'joy', 'love', 'inspired', 'confident', 'hopeful', 'content', 'energized', 'accomplished'];
const NEGATIVE_KEYWORDS = ['anxious', 'sad', 'angry', 'frustrated', 'tired', 'stressed', 'worried', 'overwhelmed', 'lonely', 'fear', 'depressed', 'hopeless', 'upset', 'exhausted'];

// Trait signal words for journal analysis
const TRAIT_KEYWORDS = {
  extraversion:        ['social', 'meeting', 'people', 'talk', 'party', 'friends', 'group', 'network', 'presentation', 'collaborate'],
  agreeableness:       ['help', 'kind', 'support', 'care', 'empathy', 'team', 'generous', 'understand', 'listen', 'cooperative'],
  conscientiousness:   ['plan', 'organize', 'deadline', 'goal', 'achieve', 'schedule', 'discipline', 'focus', 'complete', 'productive'],
  emotional_stability: ['calm', 'control', 'stable', 'manage', 'breathe', 'meditate', 'balance', 'composed', 'grounded'],
  openness:            ['creative', 'idea', 'explore', 'learn', 'curious', 'imagine', 'art', 'design', 'innovate', 'discover']
};

/**
 * Analyzes a journal entry for sentiment and personality trait signals.
 * Rule-based NLP using keyword matching.
 * 
 * @param {string} text - Journal entry content
 * @returns {Object} analysis result
 */
const analyzeJournal = (text) => {
  const lower = text.toLowerCase();
  const words = lower.match(/\b\w+\b/g) || [];

  // Sentiment scoring
  let positiveCount = 0, negativeCount = 0;
  const foundKeywords = [];

  words.forEach(word => {
    if (POSITIVE_KEYWORDS.includes(word)) { positiveCount++; foundKeywords.push(word); }
    if (NEGATIVE_KEYWORDS.includes(word)) { negativeCount++; foundKeywords.push(word); }
  });

  const totalSentimentWords = positiveCount + negativeCount;
  const sentiment = totalSentimentWords === 0 ? 0 :
    (positiveCount - negativeCount) / totalSentimentWords;

  // Trait signal scoring (0-1 scale based on keyword density)
  const traitSignals = {};
  Object.entries(TRAIT_KEYWORDS).forEach(([trait, keywords]) => {
    const matches = words.filter(w => keywords.includes(w)).length;
    traitSignals[trait] = Math.min(1, matches / 3); // Cap at 1.0
  });

  // Generate contextual summary
  const moodLabel = sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral';
  const summary = `This entry reflects a ${moodLabel} emotional state. ` +
    (foundKeywords.length > 0 ? `Key themes: ${[...new Set(foundKeywords)].slice(0, 4).join(', ')}.` : '');

  // Actionable suggestions based on mood
  const suggestions = [];
  if (sentiment < -0.2) {
    suggestions.push('Consider a short mindfulness exercise before your next session.');
    suggestions.push('Talk to someone you trust about what you\'re feeling.');
  }
  if (traitSignals.conscientiousness < 0.2) {
    suggestions.push('Try breaking your goals into smaller daily tasks tomorrow.');
  }
  if (traitSignals.openness > 0.5) {
    suggestions.push('Your creative energy is high – capture those ideas in a dedicated note.');
  }
  if (sentiment > 0.3) {
    suggestions.push('Great momentum! Reflect on what contributed to this positive state.');
  }

  return {
    sentiment: Math.round(sentiment * 100) / 100,
    keywords: [...new Set(foundKeywords)].slice(0, 8),
    traitSignals,
    summary,
    suggestions: suggestions.slice(0, 3)
  };
};

/**
 * Calculates trend data from multiple quiz results.
 * Returns per-trait change across attempts.
 * 
 * @param {Array} results - Sorted array of QuizResult documents (oldest first)
 */
const calculateTrend = (results) => {
  if (results.length < 2) return null;

  const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'emotional_stability', 'openness'];
  const trends = {};

  traits.forEach(trait => {
    const first = results[0].scores[trait];
    const last = results[results.length - 1].scores[trait];
    trends[trait] = {
      change: last - first,
      direction: last > first ? 'up' : last < first ? 'down' : 'stable',
      percentage: first > 0 ? Math.round(((last - first) / first) * 100) : 0
    };
  });

  return trends;
};

// ─── Badge awarding logic ────────────────────────────────────
const BADGES = [
  { name: 'First Step',       icon: '🌱', description: 'Completed your first quiz',        condition: (u) => u.totalQuizzes >= 1 },
  { name: 'Explorer',         icon: '🔭', description: 'Completed 5 quizzes',               condition: (u) => u.totalQuizzes >= 5 },
  { name: 'Journal Keeper',   icon: '📔', description: 'Wrote your first journal entry',    condition: (u) => u.totalJournals >= 1 },
  { name: 'Storyteller',      icon: '✍️',  description: 'Wrote 10 journal entries',          condition: (u) => u.totalJournals >= 10 },
  { name: 'On Fire 🔥',       icon: '🔥', description: '7-day activity streak',             condition: (u) => u.streakCount >= 7 },
  { name: 'Consistent',       icon: '💎', description: '30-day activity streak',            condition: (u) => u.streakCount >= 30 },
  { name: 'Self-Aware',       icon: '🪞', description: 'Completed 3 quizzes',              condition: (u) => u.totalQuizzes >= 3 },
];

/**
 * Checks which new badges a user has earned and returns them.
 * @param {Object} user - User document
 * @returns {Array} newly earned badges
 */
const checkBadges = (user) => {
  const existingBadgeNames = user.badges.map(b => b.name);
  const newBadges = [];

  BADGES.forEach(badge => {
    if (!existingBadgeNames.includes(badge.name) && badge.condition(user)) {
      newBadges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date()
      });
    }
  });

  return newBadges;
};

module.exports = {
  calculateScores,
  getDominantTrait,
  getPersonalityType,
  generateInsights,
  analyzeJournal,
  calculateTrend,
  checkBadges
};
