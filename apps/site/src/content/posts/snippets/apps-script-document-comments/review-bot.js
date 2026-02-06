/**
 * Automated document review bot.
 * Scans document for issues and adds comments.
 */
function reviewDocument() {
  const doc = DocumentApp.getActiveDocument();
  const docId = doc.getId();
  const body = doc.getBody();
  const text = body.getText();

  const issues = [];

  // Check for TODO markers
  const todoMatches = text.match(/TODO[:\s].{0,50}/gi) || [];
  todoMatches.forEach(match => {
    issues.push({
      type: 'TODO',
      text: match.trim().substring(0, 30),
      comment: '⚠️ Unresolved TODO found. Please complete or remove.'
    });
  });

  // Check for placeholder text
  const placeholders = ['[TBD]', '[INSERT]', 'Lorem ipsum', 'PLACEHOLDER'];
  placeholders.forEach(placeholder => {
    if (text.includes(placeholder)) {
      issues.push({
        type: 'Placeholder',
        text: placeholder,
        comment: `📝 Found placeholder text "${placeholder}". Please replace with actual content.`
      });
    }
  });

  // Check for very long paragraphs (readability)
  const paragraphs = text.split('\n\n');
  paragraphs.forEach(para => {
    if (para.length > 1000) {
      const preview = para.substring(0, 30);
      issues.push({
        type: 'Readability',
        text: preview,
        comment: '📖 This paragraph is very long. Consider breaking it up for readability.'
      });
    }
  });

  // Add comments for each issue
  issues.forEach(issue => {
    try {
      addAnchoredComment(docId, issue.comment, issue.text);
    } catch (e) {
      // Fallback to simple comment if anchor fails
      addComment(docId, `${issue.comment}\n\nContext: "${issue.text}"`);
    }
  });

  Logger.log(`Review complete. Found ${issues.length} issues.`);

  if (issues.length > 0) {
    DocumentApp.getUi().alert(
      'Review Complete',
      `Found ${issues.length} issues. Check the comments.`,
      DocumentApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Adds review menu to document
 */
function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔍 Review')
    .addItem('Run Review', 'reviewDocument')
    .addItem('List Comments', 'listDocumentComments')
    .addToUi();
}
