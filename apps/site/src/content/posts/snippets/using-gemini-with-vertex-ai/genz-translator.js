/**
 * Translates an email from "Gen Z" slang into proper Victorian English.
 * @param {string} emailBody - The student's email text (e.g., "no cap this exam was mid").
 * @return {string} The translated text suitable for a 19th-century gentleman or scholar.
 */
function translateGenZtoVictorian_(emailBody) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const model = MODEL; // back-compat for this snippet logic

  const prompt = `
    You are a distinguished Victorian-era scholar and translator. 
    Your task is to translate the following email, written in modern "Gen Z" slang, 
    into formal, elegant Victorian English. 
    
    Maintain the core meaning but completely change the tone to be exceedingly polite, 
    verbose, and aristocratic.

    Student's Email: "${emailBody}"
    
    Victorian Translation:
  `;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
    },
  };

  try {
    const response = VertexAI.Endpoints.generateContent(payload, model);
    const translation = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (translation) {
      console.log(`Student said: ${emailBody}`);
      console.log(`Professor heard\n\n: ${translation}`);
      return translation;
    }
    return "Error: The telegram was lost in transit.";
  } catch (e) {
    console.error("Translation failed:", e.message);
    return "Error: An unfathomable calamity has occurred.";
  }
}

function runTranslatorDemo() {
  const studentEmail =
    "Hey prof, that lecture today was straight fire. The vibes were immaculate and I'm lowkey obsessed with this topic. Slay.";
  translateGenZtoVictorian_(studentEmail);
}
