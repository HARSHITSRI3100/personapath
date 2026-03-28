const mongoose = require('mongoose');

/**
 * Stores each quiz attempt with full personality scores.
 * The scoring engine calculates traits across 5 Big-Five-inspired dimensions.
 */
const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  responses: [{
    questionId: String,
    questionText: String,
    selectedOption: Number,   // 1-5 scale
    category: String          // e.g. 'extraversion', 'emotional_stability'
  }],
  scores: {
    extraversion:         { type: Number, min: 0, max: 100, default: 0 },
    agreeableness:        { type: Number, min: 0, max: 100, default: 0 },
    conscientiousness:    { type: Number, min: 0, max: 100, default: 0 },
    emotional_stability:  { type: Number, min: 0, max: 100, default: 0 },
    openness:             { type: Number, min: 0, max: 100, default: 0 }
  },
  dominantTrait: {
    type: String,
    enum: ['extraversion', 'agreeableness', 'conscientiousness', 'emotional_stability', 'openness']
  },
  personalityType: String,  // e.g. "The Innovator", "The Harmonizer"
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for trend queries
quizResultSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
