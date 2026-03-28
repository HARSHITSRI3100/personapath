const QuizResult = require('../models/QuizResult');
const Journal = require('../models/Journal');
const User = require('../models/User');
const { generateInsights } = require('../utils/personalityEngine');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get comprehensive dashboard stats for the authenticated user
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Parallel queries for efficiency
    const [user, latestQuiz, totalQuizzes, totalJournals, recentJournals, recentQuizzes] = await Promise.all([
      User.findById(userId),
      QuizResult.findOne({ user: userId }).sort({ completedAt: -1 }),
      QuizResult.countDocuments({ user: userId }),
      Journal.countDocuments({ user: userId }),
      Journal.find({ user: userId }).sort({ createdAt: -1 }).limit(3).select('title mood createdAt aiAnalysis.sentiment'),
      QuizResult.find({ user: userId }).sort({ completedAt: -1 }).limit(5).select('scores personalityType dominantTrait completedAt')
    ]);

    // Generate insights if quiz data exists
    const insights = latestQuiz ? generateInsights(latestQuiz.scores) : null;

    // Chart data: last 5 quiz scores for radar/line chart
    const scoreHistory = recentQuizzes.map((q, i) => ({
      attempt: totalQuizzes - i,
      date: q.completedAt,
      personalityType: q.personalityType,
      dominantTrait: q.dominantTrait,
      ...q.scores
    })).reverse();

    res.json({
      user: {
        name: user.name,
        email: user.email,
        streakCount: user.streakCount,
        badges: user.badges,
        totalQuizzes,
        totalJournals,
        memberSince: user.createdAt
      },
      latestPersonality: latestQuiz ? {
        scores: latestQuiz.scores,
        dominantTrait: latestQuiz.dominantTrait,
        personalityType: latestQuiz.personalityType,
        completedAt: latestQuiz.completedAt
      } : null,
      insights: insights ? {
        strengths: insights.strengths.slice(0, 3),
        tips: insights.tips.slice(0, 2),
        careers: insights.careers.slice(0, 4)
      } : null,
      scoreHistory,
      recentJournals
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

module.exports = { getDashboardStats };
