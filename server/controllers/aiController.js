/**
 * ============================================================
 * PersonaPath – AI Controller
 * ============================================================
 */

const { analyzePersonality, analyzeJournalEntry, careerCoachChat } = require('../services/aiService');
const QuizResult = require('../models/QuizResult');
const Journal    = require('../models/Journal');
const User       = require('../models/User');

// ─── POST /api/ai/personality ────────────────────────────────
const getPersonalityAnalysis = async (req, res) => {
  try {
    // Use provided scores OR fetch latest quiz result
    let scores, personalityType, dominantTrait;

    if (req.body.scores) {
      ({ scores, personalityType, dominantTrait } = req.body);
    } else {
      const latest = await QuizResult.findOne({ user: req.user._id }).sort({ completedAt: -1 });
      if (!latest) {
        return res.status(404).json({ error: 'No quiz results found. Take the personality quiz first.' });
      }
      scores = latest.scores;
      personalityType = latest.personalityType;
      dominantTrait = latest.dominantTrait;
    }

    const analysis = await analyzePersonality(scores, personalityType, dominantTrait);

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('AI personality error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service rate limit reached. Please try again in a moment.' });
    }
    res.status(500).json({ error: 'Failed to generate AI personality analysis.' });
  }
};

// ─── POST /api/ai/journal ────────────────────────────────────
const getJournalAnalysis = async (req, res) => {
  try {
    const { content, journalId } = req.body;
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: 'Journal content must be at least 20 characters.' });
    }

    // Fetch recent mood history for context
    const recentEntries = await Journal.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('mood');
    const previousMoods = recentEntries.map(e => e.mood);

    const analysis = await analyzeJournalEntry(content, previousMoods);

    // If journalId provided, update that entry with AI analysis
    if (journalId) {
      await Journal.findOneAndUpdate(
        { _id: journalId, user: req.user._id },
        {
          'aiAnalysis.aiMood': analysis.mood,
          'aiAnalysis.sentimentScore': analysis.sentimentScore,
          'aiAnalysis.emotionalTone': analysis.emotionalTone,
          'aiAnalysis.insights': analysis.insights,
          'aiAnalysis.suggestions': analysis.suggestions,
          'aiAnalysis.keyThemes': analysis.keyThemes,
          'aiAnalysis.affirmation': analysis.affirmation,
          'aiAnalysis.isAiAnalyzed': true,
        },
        { new: true }
      );
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('AI journal error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service rate limit reached. Please try again shortly.' });
    }
    res.status(500).json({ error: 'Failed to generate AI journal analysis.' });
  }
};

// ─── POST /api/ai/chat ───────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long. Max 1000 characters.' });
    }

    // Fetch personality context
    const latest = await QuizResult.findOne({ user: req.user._id }).sort({ completedAt: -1 });
    const personality = latest
      ? { scores: latest.scores, personalityType: latest.personalityType, dominantTrait: latest.dominantTrait }
      : null;

    const reply = await careerCoachChat(message, personality, history);

    res.json({ success: true, reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('AI chat error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service busy. Please wait a moment.' });
    }
    res.status(500).json({ error: 'AI coach is unavailable. Please try again.' });
  }
};

module.exports = { getPersonalityAnalysis, getJournalAnalysis, chat };
