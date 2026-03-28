/**
 * PersonaPath – Quiz Question Bank
 * 50 carefully designed questions spanning all Big Five traits.
 * Each question has a 1-5 Likert scale response.
 * isReversed=true means the scoring is inverted (disagree = high trait).
 */

const QUIZ_QUESTIONS = [
  // ── EXTRAVERSION (10 questions) ─────────────────────────────
  {
    id: 'E1', category: 'extraversion', isReversed: false,
    text: 'I feel energized after spending time in large social gatherings.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E2', category: 'extraversion', isReversed: false,
    text: 'I\'m usually the first to start a conversation with strangers.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E3', category: 'extraversion', isReversed: true,
    text: 'I prefer quiet evenings at home over going out to social events.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E4', category: 'extraversion', isReversed: false,
    text: 'I enjoy being the center of attention in group situations.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E5', category: 'extraversion', isReversed: true,
    text: 'I need time alone to "recharge" after social interactions.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E6', category: 'extraversion', isReversed: false,
    text: 'I find it easy to talk to people I\'ve just met.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E7', category: 'extraversion', isReversed: false,
    text: 'I actively seek opportunities to meet new people.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E8', category: 'extraversion', isReversed: true,
    text: 'I often feel drained by too much social activity.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E9', category: 'extraversion', isReversed: false,
    text: 'I am talkative and expressive in group settings.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'E10', category: 'extraversion', isReversed: false,
    text: 'I enjoy leading discussions and presenting to others.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },

  // ── AGREEABLENESS (10 questions) ────────────────────────────
  {
    id: 'A1', category: 'agreeableness', isReversed: false,
    text: 'I genuinely care about how other people are feeling.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A2', category: 'agreeableness', isReversed: false,
    text: 'I try to avoid arguments and conflicts whenever possible.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A3', category: 'agreeableness', isReversed: true,
    text: 'I sometimes manipulate situations to get what I want.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A4', category: 'agreeableness', isReversed: false,
    text: 'I put others\' needs before my own quite often.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A5', category: 'agreeableness', isReversed: false,
    text: 'I find it easy to forgive people who have hurt me.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A6', category: 'agreeableness', isReversed: true,
    text: 'I\'m skeptical about people\'s true motives.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A7', category: 'agreeableness', isReversed: false,
    text: 'I enjoy helping others solve their problems.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A8', category: 'agreeableness', isReversed: false,
    text: 'I believe most people are fundamentally good.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A9', category: 'agreeableness', isReversed: true,
    text: 'I tend to be critical and demanding of others.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'A10', category: 'agreeableness', isReversed: false,
    text: 'I make people feel welcome and included.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },

  // ── CONSCIENTIOUSNESS (10 questions) ────────────────────────
  {
    id: 'C1', category: 'conscientiousness', isReversed: false,
    text: 'I always complete tasks before their deadlines.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C2', category: 'conscientiousness', isReversed: false,
    text: 'I keep my personal space organized and tidy.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C3', category: 'conscientiousness', isReversed: true,
    text: 'I often procrastinate on important tasks.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C4', category: 'conscientiousness', isReversed: false,
    text: 'I set clear goals and work systematically to achieve them.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C5', category: 'conscientiousness', isReversed: true,
    text: 'I make decisions impulsively without thinking them through.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C6', category: 'conscientiousness', isReversed: false,
    text: 'People can always rely on me to keep my word.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C7', category: 'conscientiousness', isReversed: false,
    text: 'I plan my day or week in advance to stay on track.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C8', category: 'conscientiousness', isReversed: true,
    text: 'I often leave things unfinished and move on to something new.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C9', category: 'conscientiousness', isReversed: false,
    text: 'I pay close attention to details in my work.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'C10', category: 'conscientiousness', isReversed: false,
    text: 'I track my progress toward long-term goals.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },

  // ── EMOTIONAL STABILITY (10 questions) ──────────────────────
  {
    id: 'ES1', category: 'emotional_stability', isReversed: true,
    text: 'I get stressed easily when things don\'t go as planned.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES2', category: 'emotional_stability', isReversed: false,
    text: 'I remain calm even in high-pressure situations.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES3', category: 'emotional_stability', isReversed: true,
    text: 'I worry a lot about things that might go wrong.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES4', category: 'emotional_stability', isReversed: false,
    text: 'My mood is generally stable throughout the day.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES5', category: 'emotional_stability', isReversed: true,
    text: 'I often feel anxious without a clear reason.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES6', category: 'emotional_stability', isReversed: false,
    text: 'I recover quickly from emotional setbacks.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES7', category: 'emotional_stability', isReversed: true,
    text: 'I tend to overthink problems long after they\'re resolved.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES8', category: 'emotional_stability', isReversed: false,
    text: 'I can separate my emotions from rational decision-making.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES9', category: 'emotional_stability', isReversed: true,
    text: 'Small frustrations often ruin my day.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'ES10', category: 'emotional_stability', isReversed: false,
    text: 'I handle criticism without taking it personally.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },

  // ── OPENNESS (10 questions) ──────────────────────────────────
  {
    id: 'O1', category: 'openness', isReversed: false,
    text: 'I love exploring new ideas, even if they challenge my beliefs.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O2', category: 'openness', isReversed: false,
    text: 'I enjoy art, music, or literature that is abstract or unconventional.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O3', category: 'openness', isReversed: true,
    text: 'I prefer familiar routines over new and unpredictable experiences.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O4', category: 'openness', isReversed: false,
    text: 'I frequently think about philosophical or existential questions.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O5', category: 'openness', isReversed: false,
    text: 'I\'m attracted to creative problem-solving and "thinking outside the box".',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O6', category: 'openness', isReversed: true,
    text: 'I believe practicality is more important than creativity.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O7', category: 'openness', isReversed: false,
    text: 'I love learning about topics outside my area of expertise.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O8', category: 'openness', isReversed: false,
    text: 'I enjoy experimenting with new ways of doing familiar things.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O9', category: 'openness', isReversed: true,
    text: 'I find abstract art or music confusing and pointless.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  },
  {
    id: 'O10', category: 'openness', isReversed: false,
    text: 'I often come up with creative or original ideas.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
  }
];

module.exports = { QUIZ_QUESTIONS };
