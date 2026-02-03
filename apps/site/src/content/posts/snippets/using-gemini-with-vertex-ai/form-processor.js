/**
 * Analyze form responses with Gemini.
 * Set up an "On form submit" trigger.
 */
function onFormSubmit(e) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const feedback = e.values[2];

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: `Analyze: "${feedback}"` }],
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
          summary: { type: "string" },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
        },
        required: ["sentiment", "summary", "priority"],
      },
    },
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  const json = response.candidates[0].content.parts[0].text;
  const result = JSON.parse(json);

  sheet.getRange(row, 4, 1, 3).setValues([
    [result.sentiment, result.summary, result.priority],
  ]);
}
