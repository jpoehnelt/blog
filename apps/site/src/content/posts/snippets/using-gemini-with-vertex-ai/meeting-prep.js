/**
 * Daily briefing from calendar. Run on morning trigger.
 */
function generateBriefing() {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL = `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const calendar = CalendarApp.getDefaultCalendar();
  const events = calendar.getEvents(today, tomorrow);

  const list = events.map((e) => {
    const time = e.getStartTime().toLocaleTimeString();
    return `- ${time}: ${e.getTitle()}`;
  }).join("\n");

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: `Create brief agenda with prep notes:\n${list}` }],
    }],
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  const briefing = response.candidates[0].content.parts[0].text;

  const doc = DocumentApp.create(`Briefing ${today.toLocaleDateString()}`);
  doc.getBody().appendParagraph(briefing);

  GmailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    "☀️ Daily Briefing",
    `${doc.getUrl()}\n\n${briefing}`
  );
}
