const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { QUIZ_QUESTIONS } = require('../utils/quizData');
const {
  calculateScores,
  getDominantTrait,
  getPersonalityType,
  generateInsights,
  checkBadges
} = require('../utils/personalityEngine');

/**
 * @route   GET /api/quiz/questions
 * @desc    Get all quiz questions (randomized subset of 20)
 * @access  Private
 */
const getQuestions = async (req, res) => {
  try {
    // Select 4 questions per trait (20 total) for a balanced, focused quiz
    const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'emotional_stability', 'openness'];
    let selectedQuestions = [];

    traits.forEach(trait => {
      const traitQuestions = QUIZ_QUESTIONS.filter(q => q.category === trait);
      // Shuffle and pick 4
      const shuffled = traitQuestions.sort(() => Math.random() - 0.5).slice(0, 4);
      selectedQuestions = [...selectedQuestions, ...shuffled];
    });

    // Final shuffle to mix traits
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    res.json({
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      estimatedMinutes: Math.ceil(selectedQuestions.length * 0.5)
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to load quiz questions.' });
  }
};

/**
 * @route   POST /api/quiz/submit
 * @desc    Submit quiz responses and calculate personality scores
 * @access  Private
 */
const submitQuiz = async (req, res) => {
  try {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length < 5) {
      return res.status(400).json({ error: 'Please answer at least 5 questions.' });
    }

    // Validate each response
    for (const r of responses) {
      if (!r.questionId || !r.category || !r.selectedOption) {
        return res.status(400).json({ error: 'Invalid response format.' });
      }
      if (r.selectedOption < 1 || r.selectedOption > 5) {
        return res.status(400).json({ error: 'Option values must be between 1 and 5.' });
      }
    }

    // ── Core scoring engine ──────────────────────────────────
    const scores = calculateScores(responses);
    const dominantTrait = getDominantTrait(scores);
    const personalityTypeData = getPersonalityType(scores);
    const insights = generateInsights(scores);

    // Save result to DB
    const quizResult = await QuizResult.create({
      user: req.user._id,
      responses,
      scores,
      dominantTrait,
      personalityType: `${personalityTypeData.emoji} ${personalityTypeData.name}`
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalQuizzes += 1;
    user.updateStreak();

    // Check and award new badges
    const newBadges = checkBadges(user);
    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
    }

    await user.save();

    res.status(201).json({
      message: 'Quiz completed successfully!',
      result: {
        id: quizResult._id,
        scores,
        dominantTrait,
        personalityType: personalityTypeData,
        insights,
        completedAt: quizResult.completedAt
      },
      newBadges,
      updatedUser: {
        streakCount: user.streakCount,
        totalQuizzes: user.totalQuizzes,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to process quiz submission.' });
  }
};

/**
 * @route   GET /api/quiz/history
 * @desc    Get user's quiz history (paginated)
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      QuizResult.find({ user: req.user._id })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-responses'), // Don't return raw responses in list view
      QuizResult.countDocuments({ user: req.user._id })
    ]);

    res.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz history.' });
  }
};

/**
 * @route   GET /api/quiz/:id
 * @desc    Get a specific quiz result by ID
 * @access  Private
 */
const getQuizResult = async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.id,
      user: req.user._id  // Ensure user owns this result
    });

    if (!result) {
      return res.status(404).json({ error: 'Quiz result not found.' });
    }

    const insights = generateInsights(result.scores);

    res.json({ result, insights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz result.' });
  }
};

module.exports = { getQuestions, submitQuiz, getHistory, getQuizResult };
