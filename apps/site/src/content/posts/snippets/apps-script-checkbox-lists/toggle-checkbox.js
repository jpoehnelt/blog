/**
 * Sets the checked state of a checkbox list item.
 * @param {string} docId - The document ID
 * @param {number} paragraphStart - Start index of the paragraph
 * @param {number} paragraphEnd - End index of the paragraph
 * @param {boolean} checked - Whether to check or uncheck
 */
function setCheckboxState(docId, paragraphStart, paragraphEnd, checked) {
  // Use `checkedListItem` in paragraphStyle to toggle the checkbox state.
  // Setting fields to 'checkedListItem' ensures only that property is updated.
  Docs.Documents.batchUpdate({
    requests: [{
      updateParagraphStyle: {
        range: {
          startIndex: paragraphStart,
          endIndex: paragraphEnd
        },
        paragraphStyle: {
          checkedListItem: checked
        },
        fields: 'checkedListItem'
      }
    }]
  }, docId);
}

/**
 * Finds all checkbox list items in the active document and logs their status.
 */
function findCheckboxItems() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);
  const lists = doc.lists || {};

  // Unicode glyphs used by the Docs checkbox list preset.
  const CHECKBOX_UNCHECKED = '\u2610'; // ☐
  const CHECKBOX_CHECKED   = '\u2611'; // ☑

  for (const element of doc.body.content) {
    if (!element.paragraph?.bullet) continue;

    const bullet = element.paragraph.bullet;
    const nestingLevel = bullet.nestingLevel || 0;
    const nestingLevelProps =
      lists[bullet.listId]?.listProperties?.nestingLevels?.[nestingLevel];
    const glyphSymbol = nestingLevelProps?.glyphSymbol;

    // Only process paragraphs whose list uses a checkbox glyph.
    if (glyphSymbol !== CHECKBOX_UNCHECKED && glyphSymbol !== CHECKBOX_CHECKED) {
      continue;
    }

    const text = element.paragraph.elements
      ?.map(e => e.textRun?.content || '')
      .join('')
      .trim();

    const isChecked = element.paragraph.paragraphStyle?.checkedListItem === true;
    Logger.log(`Checkbox: "${text}" — ${isChecked ? 'checked' : 'unchecked'}`);
  }
}
