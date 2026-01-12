/**
 * Generates corporate jargon from a simple phrase using Gemini.
 * @param {string} simplePhrase - The simple phrase to translate (e.g., "I'm going to lunch").
 * @return {string} The corporate jargon version.
 */
function prioritizeSynergy_(simplePhrase) {
  // TODO: Replace with your actual project ID
  const projectId = "jpoehnelt-blog";
  const region = "global";
  const modelName = "gemini-3-pro-preview";

  const model = `projects/${projectId}/locations/${region}/publishers/google/models/${modelName}`;

  const prompt = `
    Rewrite the following simple phrase into overly complex, cringeworthy corporate jargon. 
    Make it sound like a LinkedIn thought leader who just discovered a thesaurus.
    
    Simple phrase: "${simplePhrase}"
  `;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.9, // Max creativity for max cringe
    },
  };

  try {
    const response = VertexAI.Endpoints.generateContent(payload, model);

    VertexAI.En

    // Safety check just in case the AI refuses to be that annoying
    const jargon = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (jargon) {
      console.log(`Original: ${simplePhrase}`);
      console.log(`Corporate:\n\n${jargon}`);
      return jargon;
    } else {
      return "Error: Synergy levels critical. Please circle back.";
    }
  } catch (e) {
    console.error("Failed to leverage core competencies:", e.message);
    return "Error: Blocker identified.";
  }
}

function runDemo() {
  prioritizeSynergy_("I made a mistake.");
  prioritizeSynergy_("Can we meet later?");
  prioritizeSynergy_("I need a raise.");
}
