/**
 * Finds the insertion point after a heading with specific text.
 * @param {string} docId - The document ID
 * @param {string} headingText - Text to search for
 * @returns {number|null} - The index after the heading, or null
 */
function findInsertionPointAfterHeading(docId, headingText) {
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.paragraph) {
      const para = element.paragraph;
      const style = para.paragraphStyle?.namedStyleType;

      // Check if it's a heading
      if (style && style.startsWith('HEADING')) {
        // Get the text content
        const text = para.elements
          ?.map(e => e.textRun?.content || '')
          .join('')
          .trim();

        if (text === headingText) {
          // Return the index after this paragraph
          return element.endIndex;
        }
      }
    }
  }

  return null;
}

/**
 * Inserts TOC after the "Introduction" heading.
 */
function insertTocAfterIntro() {
  const docId = DocumentApp.getActiveDocument().getId();
  const insertPoint = findInsertionPointAfterHeading(docId, 'Introduction');

  if (insertPoint) {
    insertTableOfContents(docId, insertPoint);
    Logger.log('TOC inserted after Introduction');
  } else {
    Logger.log('Introduction heading not found');
  }
}
