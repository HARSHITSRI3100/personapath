/**
 * ============================================================
 * PersonaPath – AI Service
 * ============================================================
 * Centralizes all OpenAI API interactions.
 * Uses gpt-4o-mini for cost efficiency with quality output.
 * ============================================================
 */

const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Personality Analysis ────────────────────────────────────
/**
 * Generates a deep AI-powered personality analysis from Big Five scores.
 * Returns structured JSON with summary, strengths, weaknesses, and careers.
 */
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const prompt = `You are an expert personality psychologist. Analyze this Big Five personality profile and return ONLY valid JSON.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}

Scores (0-100 scale):
- Extraversion: ${scores.extraversion}
- Agreeableness: ${scores.agreeableness}
- Conscientiousness: ${scores.conscientiousness}
- Emotional Stability: ${scores.emotional_stability}
- Openness to Experience: ${scores.openness}

Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "summary": "A 3-4 sentence human-like paragraph describing this person's personality in warm, insightful language. Be specific about their trait combination.",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "weaknesses": ["growth area 1", "growth area 2", "growth area 3", "growth area 4"],
  "careerSuggestions": ["career 1", "career 2", "career 3", "career 4", "career 5", "career 6"],
  "growthTips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "compatibleTypes": ["personality type 1", "personality type 2"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  return JSON.parse(raw);
};

// ─── Journal Analysis ────────────────────────────────────────
/**
 * Analyzes a journal entry for mood, sentiment, and psychological insights.
 */
const analyzeJournalEntry = async (content, previousMoods = []) => {
  const contextStr = previousMoods.length > 0
    ? `\nRecent mood history: ${previousMoods.slice(-5).join(', ')}`
    : '';

  const prompt = `You are an empathetic AI journal analyst. Analyze this journal entry and return ONLY valid JSON.
${contextStr}

Journal Entry:
"""
${content.substring(0, 2000)}
"""

Return ONLY this exact JSON structure, no markdown:
{
  "mood": "one of: happy, sad, stressed, anxious, excited, grateful, neutral, angry, hopeful, tired",
  "sentimentScore": <number 0-100, where 0=very negative, 50=neutral, 100=very positive>,
  "emotionalTone": "brief 5-7 word description of the emotional tone",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "keyThemes": ["theme 1", "theme 2", "theme 3"],
  "affirmation": "a warm, personalized encouraging sentence for this person"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  return JSON.parse(raw);
};

// ─── Career Coach Chat ───────────────────────────────────────
/**
 * Context-aware career coaching chat.
 * Uses personality data + conversation history for personalized responses.
 */
const careerCoachChat = async (message, personality, chatHistory = []) => {
  const systemPrompt = `You are Alex, a warm, expert AI career coach and life coach specializing in personality-based career development. 

${personality ? `You are talking to someone with this personality profile:
- Personality Type: ${personality.personalityType}
- Dominant Trait: ${personality.dominantTrait?.replace('_', ' ')}
- Extraversion: ${personality.scores?.extraversion}/100
- Agreeableness: ${personality.scores?.agreeableness}/100
- Conscientiousness: ${personality.scores?.conscientiousness}/100
- Emotional Stability: ${personality.scores?.emotional_stability}/100
- Openness: ${personality.scores?.openness}/100

Tailor ALL advice specifically to their personality profile.` : 'You don\'t have their personality data yet - encourage them to take the quiz.'}

Guidelines:
- Be warm, encouraging, and personalized
- Give specific, actionable advice 
- Reference their personality traits when relevant
- Keep responses concise (2-4 paragraphs max)
- Use "you" language and be conversational
- If asked about career paths, relate them to their Big Five scores`;

  const messages = [
    { role: 'system', content: systemPrompt },
    // Include recent chat history (last 10 messages for context)
    ...chatHistory.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: 'user', content: message }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
    temperature: 0.75,
  });

  return response.choices[0].message.content;
};

module.exports = { analyzePersonality, analyzeJournalEntry, careerCoachChat };
