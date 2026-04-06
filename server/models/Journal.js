const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  mood: {
    type: String,
    enum: ['ecstatic', 'happy', 'neutral', 'sad', 'anxious', 'angry'],
    default: 'neutral'
  },
  aiAnalysis: {
    // Rule-based fields (original)
    sentiment:  { type: Number, min: -1, max: 1, default: 0 },
    keywords:   [String],
    traitSignals: {
      extraversion:        { type: Number, default: 0 },
      agreeableness:       { type: Number, default: 0 },
      conscientiousness:   { type: Number, default: 0 },
      emotional_stability: { type: Number, default: 0 },
      openness:            { type: Number, default: 0 }
    },
    summary:     String,
    suggestions: [String],

    // GPT-4o AI fields (new)
    isAiAnalyzed:  { type: Boolean, default: false },
    aiMood:        String,
    sentimentScore: { type: Number, min: 0, max: 100 },
    emotionalTone: String,
    insights:     [String],
    keyThemes:    [String],
    affirmation:  String,
  },
  tags:       [String],
  isAnalyzed: { type: Boolean, default: false }
}, { timestamps: true });

journalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', journalSchema);
