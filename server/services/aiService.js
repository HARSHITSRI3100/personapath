const fetch = require("node-fetch");

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY;

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

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

  } catch (err) {
    console.error("AI ERROR:", err);
    return {
      summary: "AI temporarily unavailable",
      strengths: [],
      weaknesses: [],
      careerSuggestions: [],
      growthTips: [],
      compatibleTypes: []
    };
  }
};

// ─── Personality Analysis ────────────────────────────────────
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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