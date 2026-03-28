/**
 * PersonaPath – Database Seed Script
 * Run: node utils/seedData.js
 * Creates a demo user with quiz results and journal entries.
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const Journal = require('../models/Journal');
const { analyzeJournal } = require('./personalityEngine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personapath';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing demo data
  await User.deleteOne({ email: 'demo@personapath.com' });
  console.log('🗑️  Cleared existing demo user');

  // Create demo user
  const user = await User.create({
    name: 'Alex Morgan',
    email: 'demo@personapath.com',
    password: 'demo1234',
    streakCount: 5,
    totalQuizzes: 3,
    totalJournals: 4,
    badges: [
      { name: 'First Step', icon: '🌱', description: 'Completed your first quiz' },
      { name: 'Journal Keeper', icon: '📔', description: 'Wrote your first journal entry' },
      { name: 'Self-Aware', icon: '🪞', description: 'Completed 3 quizzes' }
    ]
  });
  console.log('👤 Demo user created:', user.email);

  // Create 3 quiz results over time (simulating growth)
  const quizResults = [
    {
      user: user._id,
      responses: [],
      scores: { extraversion: 45, agreeableness: 60, conscientiousness: 55, emotional_stability: 40, openness: 70 },
      dominantTrait: 'openness',
      personalityType: '💡 The Innovator',
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    },
    {
      user: user._id,
      responses: [],
      scores: { extraversion: 50, agreeableness: 65, conscientiousness: 60, emotional_stability: 45, openness: 72 },
      dominantTrait: 'openness',
      personalityType: '💡 The Innovator',
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      user: user._id,
      responses: [],
      scores: { extraversion: 55, agreeableness: 68, conscientiousness: 65, emotional_stability: 52, openness: 75 },
      dominantTrait: 'openness',
      personalityType: '💡 The Innovator',
      completedAt: new Date() // Today
    }
  ];

  await QuizResult.insertMany(quizResults);
  console.log('📊 3 quiz results seeded');

  // Create sample journal entries
  const journals = [
    {
      user: user._id, title: 'Starting my self-improvement journey',
      content: 'Today I decided to take the personality quiz and I feel inspired and motivated. I want to learn more about myself and grow as a person. I am curious about what my results mean for my career.',
      mood: 'happy', tags: ['growth', 'motivation'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      user: user._id, title: 'Feeling overwhelmed at work',
      content: 'Had a stressful day. Feeling anxious and overwhelmed with deadlines. I need to organize my tasks better and focus on one thing at a time. I worry too much about what others think.',
      mood: 'anxious', tags: ['work', 'stress'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      user: user._id, title: 'Creative breakthrough!',
      content: 'Had an amazing day. Felt so creative and inspired. Came up with a new idea for a project that could help my team. I love exploring new concepts and learning. Grateful for this energy.',
      mood: 'ecstatic', tags: ['creativity', 'ideas'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      user: user._id, title: 'Reflecting on my progress',
      content: 'Looking back at the past month, I feel calm and content. I have been more organized and productive. My relationships feel stronger. I am proud of how much I have grown.',
      mood: 'happy', tags: ['reflection', 'growth'],
      createdAt: new Date()
    }
  ];

  // Attach AI analysis to each
  const analyzed = journals.map(j => ({
    ...j,
    aiAnalysis: analyzeJournal(j.content),
    isAnalyzed: true
  }));

  await Journal.insertMany(analyzed);
  console.log('📔 4 journal entries seeded');

  console.log('\n✅ Seed complete!');
  console.log('📧 Demo login: demo@personapath.com');
  console.log('🔑 Password: demo1234\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
