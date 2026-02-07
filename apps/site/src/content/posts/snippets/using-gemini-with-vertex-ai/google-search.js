/**
 * Enable Google Search for real-time info with citations.
 */
function searchGrounded(query) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL =
    `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: query }],
      },
    ],
    tools: [{ googleSearch: {} }],
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  const candidate = response.candidates[0];
  const meta = candidate.groundingMetadata;

  return {
    text: candidate.content.parts[0].text,
    sources: meta?.groundingChunks || [],
    queries: meta?.webSearchQueries || [],
  };
}
