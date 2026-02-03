/**
 * Force Gemini to return valid JSON matching your schema.
 */
function analyzeWithSchema(text) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: `Analyze: "${text}"` }],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "neutral"],
          },
          topics: {
            type: "array",
            items: { type: "string" },
          },
          confidence: { type: "number" },
        },
        required: ["sentiment", "topics", "confidence"],
      },
    },
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  return JSON.parse(response.candidates[0].content.parts[0].text);
}
