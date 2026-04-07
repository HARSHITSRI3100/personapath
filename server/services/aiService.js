/**
 * PersonaPath – AI Service (Gemini)
 * Uses gemini-1.5-flash via REST — no SDK needed, works on all Node versions
 */

const https = require('https');

// ─── Helper: POST to Gemini REST API ────────────────────────
const callGemini = (prompt) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY not set'));

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Gemini timeout')); });
    req.write(body);
    req.end();
  });
};

// ─── Helper: safely extract JSON from Gemini text ───────────
const extractJSON = (text, fallback) => {
  try {
    // Strip markdown code fences
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find first { ... } block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    return JSON.parse(match[0]);
  } catch {
    return fallback;
  }
};

// ─── Personality Analysis ────────────────────────────────────
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const fallback = {
    summary: 'Unable to generate analysis right now. Please try again.',
    strengths: [],
    weaknesses: [],
    careerSuggestions: [],
    growthTips: [],
    compatibleTypes: [],
  };

  try {
    const prompt = `You are an expert personality psychologist. Analyze this Big Five personality profile.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}
Scores (0-100): Extraversion=${scores.extraversion}, Agreeableness=${scores.agreeableness}, Conscientiousness=${scores.conscientiousness}, Emotional Stability=${scores.emotional_stability}, Openness=${scores.openness}

Respond with ONLY a JSON object, no markdown, no explanation:
{
  "summary": "3-4 warm, insightful sentences about this specific personality combination",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "weaknesses": ["growth area 1", "growth area 2", "growth area 3"],
  "careerSuggestions": ["career 1", "career 2", "career 3", "career 4", "career 5"],
  "growthTips": ["tip 1", "tip 2", "tip 3"],
  "compatibleTypes": ["type 1", "type 2"]
}`;

    const text = await callGemini(prompt);
    return extractJSON(text, fallback);
  } catch (err) {
    console.error('Personality AI error:', err.message);
    return fallback;
  }
};

// ─── Journal Analysis ────────────────────────────────────────
const analyzeJournalEntry = async (content, previousMoods = []) => {
  const fallback = {
    mood: 'neutral',
    sentimentScore: 50,
    emotionalTone: 'balanced and calm',
    insights: [],
    suggestions: [],
    keyThemes: [],
    affirmation: 'Keep going — every entry is progress.',
  };

  try {
    const moodContext = previousMoods.length > 0
      ? `Recent mood history: ${previousMoods.join(', ')}.`
      : '';

    const prompt = `You are an empathetic journal analyst. Analyze this journal entry.

${moodContext}

Journal entry:
"${content.substring(0, 2000)}"

Respond with ONLY a JSON object, no markdown:
{
  "mood": "one of: happy, sad, stressed, anxious, excited, grateful, neutral, angry, hopeful, tired",
  "sentimentScore": 65,
  "emotionalTone": "5-7 word description",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keyThemes": ["theme 1", "theme 2"],
  "affirmation": "one warm encouraging sentence"
}`;

    const text = await callGemini(prompt);
    return extractJSON(text, fallback);
  } catch (err) {
    console.error('Journal AI error:', err.message);
    return fallback;
  }
};

// ─── Career Coach Chat ───────────────────────────────────────
const careerCoachChat = async (message, personality, history = []) => {
  try {
    const personalityContext = personality
      ? `User's personality: ${personality.personalityType}, dominant trait: ${personality.dominantTrait?.replace('_', ' ')}, scores: Extraversion=${personality.scores?.extraversion}, Conscientiousness=${personality.scores?.conscientiousness}, Openness=${personality.scores?.openness}, Agreeableness=${personality.scores?.agreeableness}, Emotional Stability=${personality.scores?.emotional_stability}.`
      : 'No personality data yet — encourage the user to take the quiz.';

    const historyText = history.slice(-6)
      .map(h => `${h.role === 'user' ? 'User' : 'Alex'}: ${h.content}`)
      .join('\n');

    const prompt = `You are Alex, a warm and expert AI career coach specializing in personality-based career development.

${personalityContext}

${historyText ? `Conversation so far:\n${historyText}\n` : ''}

User: ${message}

Respond as Alex — warm, specific, actionable. Reference their personality traits when relevant. Keep it to 2-3 paragraphs. Do NOT use JSON, just write naturally.`;

    const text = await callGemini(prompt);
    return text || 'I had trouble responding. Please try again.';
  } catch (err) {
    console.error('Chat AI error:', err.message);
    return 'I\'m having a moment — please send your message again!';
  }
};

module.exports = { analyzePersonality, analyzeJournalEntry, careerCoachChat };