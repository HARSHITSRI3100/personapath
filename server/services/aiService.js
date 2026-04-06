const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safe JSON extractor
const extractJSON = (text) => {
  try {
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      console.error("RAW AI RESPONSE:", text);
      return fallbackResponse();
    }

    return JSON.parse(match[0]);

  } catch (err) {
    console.error("JSON PARSE ERROR:", err);
    return fallbackResponse();
  }
};

const fallbackResponse = () => ({
  summary: "AI analysis temporarily unavailable. Please try again.",
  strengths: ["Self-awareness"],
  weaknesses: ["Temporary issue"],
  careerSuggestions: ["Try again later"],
  growthTips: ["Retry analysis"],
  compatibleTypes: []
});

// ─── Personality Analysis ────────────────────────────────────
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
You are an expert psychologist.

STRICT RULE:
Return ONLY valid JSON. No text. No explanation.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}
Scores: ${JSON.stringify(scores)}

JSON FORMAT:
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "careerSuggestions": ["string"],
  "growthTips": ["string"],
  "compatibleTypes": ["string"]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return extractJSON(text);
};

// ─── Journal Analysis ────────────────────────────────────────
const analyzeJournalEntry = async (content, previousMoods = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
Analyze this journal entry:

"${content}"

Previous moods: ${previousMoods.join(", ")}

Return JSON:
{
  "mood": "",
  "sentimentScore": 0,
  "emotionalTone": "",
  "insights": [],
  "suggestions": [],
  "keyThemes": [],
  "affirmation": ""
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return extractJSON(text);
};

// ─── Career Coach Chat ───────────────────────────────────────
const careerCoachChat = async (message, personality, chatHistory = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const context = `
You are Alex, a smart career coach.

Personality:
${personality ? JSON.stringify(personality) : "No data"}

Chat history:
${chatHistory.map(m => `${m.role}: ${m.content}`).join("\n")}

User: ${message}
`;

  const result = await model.generateContent(context);
  return result.response.text();
};

module.exports = {
  analyzePersonality,
  analyzeJournalEntry,
  careerCoachChat
};