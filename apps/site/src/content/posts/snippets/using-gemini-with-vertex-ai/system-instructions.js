/**
 * Set persistent persona/rules with systemInstruction.
 */
function queryWithSystem(prompt) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const payload = {
    systemInstruction: {
      parts: [{
        text: `You are a helpful assistant. Be concise.
Use bullet points for lists.`,
      }],
    },
    contents: [{
      role: "user",
      parts: [{ text: prompt }],
    }],
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  return response.candidates[0].content.parts[0].text;
}

/**
 * Multi-turn: pass conversation history in contents.
 */
function chat(history, message) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  history.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = VertexAI.Endpoints.generateContent(
    { contents: history },
    MODEL
  );
  const reply = response.candidates[0].content.parts[0].text;

  history.push({
    role: "model",
    parts: [{ text: reply }],
  });

  return { reply, history };
}
