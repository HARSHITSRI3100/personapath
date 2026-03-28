const QuizResult = require('../models/QuizResult');
const Journal = require('../models/Journal');
const { generateInsights, calculateTrend } = require('../utils/personalityEngine');

/**
 * @route   GET /api/analysis/latest
 * @desc    Get AI insights from the user's most recent quiz
 * @access  Private
 */
const getLatestAnalysis = async (req, res) => {
  try {
    const latest = await QuizResult.findOne({ user: req.user._id })
      .sort({ completedAt: -1 });

    if (!latest) {
      return res.status(404).json({
        error: 'No quiz results found. Take the personality quiz to get insights!'
      });
    }

    const insights = generateInsights(latest.scores);

    res.json({
      quizId: latest._id,
      completedAt: latest.completedAt,
      scores: latest.scores,
      dominantTrait: latest.dominantTrait,
      personalityType: latest.personalityType,
      insights
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analysis.' });
  }
};

/**
 * @route   GET /api/analysis/trend
 * @desc    Get personality growth trend across all quiz attempts
 * @access  Private
 */
const getTrend = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .sort({ completedAt: 1 })   // Oldest first for trend calculation
      .select('scores completedAt personalityType dominantTrait');

    if (results.length === 0) {
      return res.status(404).json({ error: 'No quiz data available for trend analysis.' });
    }

    const trend = calculateTrend(results);

    // Prepare chart-friendly data: array of score objects per attempt
    const chartData = results.map((r, index) => ({
      attempt: index + 1,
      date: r.completedAt,
      label: `Quiz ${index + 1}`,
      personalityType: r.personalityType,
      ...r.scores
    }));

    res.json({
      totalAttempts: results.length,
      trend,
      chartData,
      firstAttempt: results[0],
      latestAttempt: results[results.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate trend.' });
  }
};

/**
 * @route   GET /api/analysis/mood-trend
 * @desc    Get mood trend from journal entries (last 30 days)
 * @access  Private
 */
const getMoodTrend = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const entries = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: 1 })
      .select('mood aiAnalysis.sentiment createdAt title');

    const moodMap = { ecstatic: 5, happy: 4, neutral: 3, sad: 2, anxious: 1, angry: 1 };

    const chartData = entries.map(e => ({
      date: e.createdAt,
      mood: e.mood,
      moodScore: moodMap[e.mood] || 3,
      sentiment: e.aiAnalysis?.sentiment || 0,
      title: e.title
    }));

    // Average sentiment
    const avgSentiment = chartData.length > 0
      ? chartData.reduce((a, b) => a + b.sentiment, 0) / chartData.length
      : 0;

    const moodCounts = {};
    entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    res.json({
      chartData,
      moodDistribution: moodCounts,
      averageSentiment: Math.round(avgSentiment * 100) / 100,
      totalEntries: entries.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood trend.' });
  }
};

module.exports = { getLatestAnalysis, getTrend, getMoodTrend };
