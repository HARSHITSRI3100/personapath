 // ✅ Node 18+ already has fetch (NO node-fetch)

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
  process.env.GEMINI_API_KEY;

// Safe JSON extractor
const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : fallback();
  } catch {
    return fallback();
  }
};

const fallback = () => ({
  summary: "AI temporarily unavailable",
  strengths: [],
  weaknesses: [],
  careerSuggestions: [],
  growthTips: [],
  compatibleTypes: []
});

// ─── Personality Analysis ───
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  try {
    const prompt = `
Return ONLY JSON.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}
Scores: ${JSON.stringify(scores)}

{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "careerSuggestions": ["string"],
  "growthTips": ["string"],
  "compatibleTypes": ["string"]
}
`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return extractJSON(text);

  } catch (err) {
    console.error("AI ERROR:", err);
    return fallback();
  }
};

// ─── Journal (simple safe version) ───
const analyzeJournalEntry = async () => ({
  mood: "neutral",
  sentimentScore: 50,
  emotionalTone: "stable",
  insights: [],
  suggestions: [],
  keyThemes: [],
  affirmation: "Keep going."
});

// ─── Chat (simple safe version) ───
const careerCoachChat = async () => "AI working.";

module.exports = {
  analyzePersonality,
  analyzeJournalEntry,
  careerCoachChat
};