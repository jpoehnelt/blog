/**
 * Adjust content filtering thresholds.
 * Thresholds: BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE,
 *             BLOCK_ONLY_HIGH, BLOCK_NONE
 */
function queryWithSafety(prompt) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }],
    }],
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  const candidate = response.candidates[0];

  if (candidate.finishReason === "SAFETY") {
    return { blocked: true, ratings: candidate.safetyRatings };
  }
  return { blocked: false, text: candidate.content.parts[0].text };
}
