/**
 * PersonaPath – AI Service (Groq - Free & Fast)
 */

const https = require('https');

// ─── Helper: call Groq API ────────────────────────────────────
const callGroq = async (prompt, systemPrompt = '') => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            const err = new Error(parsed.error.message);
            if (res.statusCode === 429) err.status = 429;
            return reject(err);
          }
          const text = parsed?.choices?.[0]?.message?.content || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Groq response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Groq timeout')); });
    req.write(body);
    req.end();
  });
};

// ─── Helper: safely extract JSON ─────────────────────────────
const extractJSON = (text, fallback) => {
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    return JSON.parse(match[0]);
  } catch {
    return fallback;
  }
};

// ─── Personality Analysis ─────────────────────────────────────
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
    const system = 'You are an expert personality psychologist. Always respond with valid JSON only — no markdown, no explanation, no code fences.';
    const prompt = `Analyze this Big Five personality profile.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}
Scores (0-100): Extraversion=${scores.extraversion}, Agreeableness=${scores.agreeableness}, Conscientiousness=${scores.conscientiousness}, Emotional Stability=${scores.emotional_stability}, Openness=${scores.openness}

Respond with ONLY this JSON:
{
  "summary": "3-4 warm, insightful sentences about this specific personality combination",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "weaknesses": ["growth area 1", "growth area 2", "growth area 3"],
  "careerSuggestions": ["career 1", "career 2", "career 3", "career 4", "career 5"],
  "growthTips": ["tip 1", "tip 2", "tip 3"],
  "compatibleTypes": ["type 1", "type 2"]
}`;

    const text = await callGroq(prompt, system);
    return extractJSON(text, fallback);
  } catch (err) {
    console.error('Personality AI error:', err.message);
    if (err.status === 429) throw err;
    return fallback;
  }
};

// ─── Journal Analysis ─────────────────────────────────────────
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

    const system = 'You are an empathetic journal analyst. Always respond with valid JSON only — no markdown, no explanation.';
    const prompt = `Analyze this journal entry.

${moodContext}

Journal entry:
"${content.substring(0, 2000)}"

Respond with ONLY this JSON:
{
  "mood": "one of: happy, sad, stressed, anxious, excited, grateful, neutral, angry, hopeful, tired",
  "sentimentScore": 65,
  "emotionalTone": "5-7 word description",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keyThemes": ["theme 1", "theme 2"],
  "affirmation": "one warm encouraging sentence"
}`;

    const text = await callGroq(prompt, system);
    return extractJSON(text, fallback);
  } catch (err) {
    console.error('Journal AI error:', err.message);
    if (err.status === 429) throw err;
    return fallback;
  }
};

// ─── Career Coach Chat ────────────────────────────────────────
const careerCoachChat = async (message, personality, history = []) => {
  try {
    const personalityContext = personality
      ? `User's personality: ${personality.personalityType}, dominant trait: ${personality.dominantTrait?.replace('_', ' ')}, scores: Extraversion=${personality.scores?.extraversion}, Conscientiousness=${personality.scores?.conscientiousness}, Openness=${personality.scores?.openness}, Agreeableness=${personality.scores?.agreeableness}, Emotional Stability=${personality.scores?.emotional_stability}.`
      : 'No personality data yet — encourage the user to take the quiz.';

    const system = `You are Alex, a warm and expert AI career coach specializing in personality-based career development. ${personalityContext} Respond warmly, specifically, and actionably. Reference personality traits when relevant. Keep responses to 2-3 paragraphs. Write naturally, no JSON.`;

    const historyText = history.slice(-6)
      .map(h => `${h.role === 'user' ? 'User' : 'Alex'}: ${h.content}`)
      .join('\n');

    const prompt = historyText
      ? `Conversation so far:\n${historyText}\n\nUser: ${message}`
      : message;

    const text = await callGroq(prompt, system);
    return text || 'I had trouble responding. Please try again.';
  } catch (err) {
    console.error('Chat AI error:', err.message);
    if (err.status === 429) throw err;
    throw err;
  }
};

module.exports = { analyzePersonality, analyzeJournalEntry, careerCoachChat };
