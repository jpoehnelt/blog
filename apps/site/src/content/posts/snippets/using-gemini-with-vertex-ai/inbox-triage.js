/**
 * Triage unread emails. Run on a time-based trigger.
 */
function triageInbox() {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const threads = GmailApp.search("is:unread newer_than:1h", 0, 10);

  threads.forEach((thread) => {
    const msg = thread.getMessages().pop();
    const prompt = `Summarize and rate urgency (HIGH/MEDIUM/LOW):
From: ${msg.getFrom()}
Subject: ${thread.getFirstMessageSubject()}
Body: ${msg.getPlainBody().substring(0, 1000)}`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }],
      }],
    };

    const response = VertexAI.Endpoints.generateContent(payload, MODEL);
    const analysis = response.candidates[0].content.parts[0].text;

    if (analysis.includes("HIGH")) {
      const label = GmailApp.getUserLabelByName("AI/Urgent")
        || GmailApp.createLabel("AI/Urgent");
      thread.addLabel(label);
    }

    console.log(`${thread.getFirstMessageSubject()}: ${analysis}`);
  });
}
