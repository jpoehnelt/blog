/**
 * Analyzes an image using Gemini's multimodal capabilities.
 * @param {string} base64Image - The base64 encoded image string.
 * @param {string} mimeType - The mime type of the image (e.g., "image/jpeg").
 * @return {string} The model's description of the image.
 */
function analyzeImage_(data, mimeType) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const model = MODEL;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: "Succintly describe what is happening in this image." },
          {
            inlineData: {
              mimeType,
              data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
    },
  };

  try {
    const response = VertexAI.Endpoints.generateContent(payload, model);
    const description = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(description);
    return description;
  } catch (e) {
    console.error("Analysis failed:", e.message);
    return "Error: Could not see the image.";
  }
}

function runMultimodalDemo() {
  // Fetch an image from the web (or Drive)
  const imageUrl =
    "https://media.githubusercontent.com/media/jpoehnelt/blog/refs/heads/main/apps/site/src/lib/images/mogollon-monster-100/justin-poehnelt-during-ultramarathon.jpeg";
  const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  const base64Image = Utilities.base64Encode(imageBlob.getBytes());
  const mimeType = imageBlob.getContentType() || "image/jpeg";
  analyzeImage_(base64Image, mimeType);
}
