/**
 * Scan receipt images and rename with extracted metadata.
 */
function organizeReceipts() {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const folder = DriveApp.getFoldersByName("Receipts").next();
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (!file.getMimeType().startsWith("image/")) continue;

    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());

    const payload = {
      contents: [{
        role: "user",
        parts: [
          { text: "Extract: vendor, date (YYYY-MM-DD), amount. JSON." },
          {
            inlineData: {
              mimeType: file.getMimeType(),
              data: base64,
            },
          },
        ],
      }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const response = VertexAI.Endpoints.generateContent(payload, MODEL);
    const json = response.candidates[0].content.parts[0].text;
    const data = JSON.parse(json);

    const newName = `${data.date}_${data.vendor}_${data.amount}.jpg`;
    file.setName(newName);
    console.log(`Renamed: ${newName}`);
  }
}
