/**
 * Rewrite selected text in Docs. Add menu via onOpen().
 */
function rewriteSelection(style) {
  const PROJECT_ID = "your-project-id";
  const REGION = "us-central1";
  const MODEL =
    `projects/${PROJECT_ID}/locations/${REGION}` +
    `/publishers/google/models/gemini-2.5-flash`;

  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();
  if (!selection) {
    return DocumentApp.getUi().alert("Select text first.");
  }

  const el = selection.getRangeElements()[0];
  const text = el.getElement().asText();
  const start = el.getStartOffset();
  const end = el.getEndOffsetInclusive();
  const selected = text.getText().substring(start, end + 1);

  const styles = {
    formal: "Rewrite formally:",
    casual: "Rewrite casually:",
    concise: "Make concise:",
  };

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${styles[style]} "${selected}"` }],
      },
    ],
  };

  const response = VertexAI.Endpoints.generateContent(payload, MODEL);
  const rewritten = response.candidates[0].content.parts[0].text.trim();

  text.deleteText(start, end);
  text.insertText(start, rewritten);
}

function onOpen() {
  DocumentApp.getUi()
    .createMenu("✨ AI")
    .addItem("Formal", "rewriteFormal")
    .addItem("Casual", "rewriteCasual")
    .addItem("Concise", "rewriteConcise")
    .addToUi();
}

function rewriteFormal() {
  rewriteSelection("formal");
}
function rewriteCasual() {
  rewriteSelection("casual");
}
function rewriteConcise() {
  rewriteSelection("concise");
}
