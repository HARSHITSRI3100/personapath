const Journal = require('../models/Journal');
const User = require('../models/User');
const { analyzeJournal, checkBadges } = require('../utils/personalityEngine');

/**
 * @route   POST /api/journal
 * @desc    Create a new journal entry with AI analysis
 * @access  Private
 */
const createEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Run AI analysis on the journal content
    const aiAnalysis = analyzeJournal(content);

    const entry = await Journal.create({
      user: req.user._id,
      title,
      content,
      mood: mood || 'neutral',
      tags: tags || [],
      aiAnalysis,
      isAnalyzed: true
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalJournals += 1;
    user.updateStreak();

    const newBadges = checkBadges(user);
    if (newBadges.length > 0) user.badges.push(...newBadges);

    await user.save();

    res.status(201).json({
      message: 'Journal entry saved!',
      entry,
      newBadges
    });
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
};

/**
 * @route   GET /api/journal
 * @desc    Get user's journal entries (paginated)
 * @access  Private
 */
const getEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Journal.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Journal.countDocuments({ user: req.user._id })
    ]);

    res.json({
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
};

/**
 * @route   GET /api/journal/:id
 * @desc    Get a single journal entry
 * @access  Private
 */
const getEntry = async (req, res) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ error: 'Journal entry not found.' });
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry.' });
  }
};

/**
 * @route   PUT /api/journal/:id
 * @desc    Update a journal entry (re-runs AI analysis)
 * @access  Private
 */
const updateEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;
    const aiAnalysis = content ? analyzeJournal(content) : undefined;

    const update = {
      ...(title && { title }),
      ...(content && { content }),
      ...(mood && { mood }),
      ...(tags && { tags }),
      ...(aiAnalysis && { aiAnalysis, isAnalyzed: true })
    };

    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!entry) return res.status(404).json({ error: 'Journal entry not found.' });

    res.json({ message: 'Entry updated!', entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry.' });
  }
};

/**
 * @route   DELETE /api/journal/:id
 * @desc    Delete a journal entry
 * @access  Private
 */
const deleteEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ error: 'Journal entry not found.' });
    res.json({ message: 'Entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry.' });
  }
};

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };
