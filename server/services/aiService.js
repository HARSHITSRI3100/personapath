const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
  process.env.GEMINI_API_KEY;

// universal safe parser
const safeParse = (text, fallbackData) => {
  try {
    if (!text) return fallbackData;

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallbackData;

    return JSON.parse(match[0]);
  } catch {
    return fallbackData;
  }
};

// ─── Personality ───
const analyzePersonality = async (scores, personalityType, dominantTrait) => {
  const fallback = {
    summary: "AI temporarily unavailable",
    strengths: [],
    weaknesses: [],
    careerSuggestions: [],
    growthTips: [],
    compatibleTypes: []
  };

  try {
    const prompt = `
Return ONLY JSON.

Personality Type: ${personalityType}
Dominant Trait: ${dominantTrait}
Scores: ${JSON.stringify(scores)}

{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "careerSuggestions": [],
  "growthTips": [],
  "compatibleTypes": []
}
`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return safeParse(text, fallback);

  } catch (err) {
    console.error("PERSONALITY ERROR:", err);
    return fallback;
  }
};

// ─── Journal ───
const analyzeJournalEntry = async (content, previousMoods = []) => {
  const fallback = {
    mood: "neutral",
    sentimentScore: 50,
    emotionalTone: "stable",
    insights: [],
    suggestions: [],
    keyThemes: [],
    affirmation: "Keep going."
  };

  try {
    const prompt = `
Analyze this journal:

"${content}"

Previous moods: ${previousMoods.join(", ")}

Return ONLY JSON:
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

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return safeParse(text, fallback);

  } catch (err) {
    console.error("JOURNAL ERROR:", err);
    return fallback;
  }
};

// ─── Chat ───
const careerCoachChat = async (message, personality, history = []) => {
  try {
    const prompt = `
You are a career coach.

Personality:
${personality ? JSON.stringify(personality) : "none"}

Chat:
${history.map(h => `${h.role}: ${h.content}`).join("\n")}

User: ${message}
`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI is busy. Try again."
    );

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return "AI is temporarily unavailable.";
  }
};

// ✅ DON'T FORGET THIS
module.exports = {
  analyzePersonality,
  analyzeJournalEntry,
  careerCoachChat
};