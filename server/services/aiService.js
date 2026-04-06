const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safe JSON extractor
const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match[0]);
  } catch {
    throw new Error("Invalid AI JSON response");
  }
};

// ─── Personality Analysis ────────────────────────────────────
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert personality psychologist.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}

Scores:
${JSON.stringify(scores)}

Return ONLY JSON:
{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "careerSuggestions": [],
  "growthTips": [],
  "compatibleTypes": []
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