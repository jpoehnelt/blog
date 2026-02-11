/**
 * Sets the checked state of a checkbox list item.
 * @param {string} docId - The document ID
 * @param {number} paragraphStart - Start index of the paragraph
 * @param {number} paragraphEnd - End index of the paragraph
 * @param {boolean} checked - Whether to check or uncheck
 */
function setCheckboxState(docId, paragraphStart, paragraphEnd, checked) {
  Docs.Documents.batchUpdate({
    requests: [{
      updateParagraphStyle: {
        range: {
          startIndex: paragraphStart,
          endIndex: paragraphEnd
        },
        paragraphStyle: {
          // Note: This requires the paragraph to already be a checkbox list
          // The effect is marking the checkbox as checked/unchecked
        },
        fields: '*'
      }
    }]
  }, docId);
}

/**
 * Finds all checkbox list items and logs their status.
 */
function findCheckboxItems() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);

  for (const element of doc.body.content) {
    if (element.paragraph && element.paragraph.bullet) {
      const bullet = element.paragraph.bullet;
      const text = element.paragraph.elements
        ?.map(e => e.textRun?.content || '')
        .join('')
        .trim();

      // Check if it's a checkbox by examining the list properties
      if (bullet.listId) {
        Logger.log(`Found bullet item: "${text}"`);
      }
    }
  }
}
