/**
 * Creates a checkbox list from an array of items.
 * @param {string} docId - The document ID
 * @param {number} startIndex - Where to insert the list
 * @param {string[]} items - Array of list items
 */
function createCheckboxList(docId, startIndex, items) {
  const text = items.join('\n') + '\n';

  Docs.Documents.batchUpdate({
    requests: [
      {
        insertText: {
          location: { index: startIndex },
          text: text
        }
      },
      {
        createParagraphBullets: {
          range: {
            startIndex: startIndex,
            endIndex: startIndex + text.length
          },
          bulletPreset: 'BULLET_CHECKBOX'
        }
      }
    ]
  }, docId);
}

/**
 * Adds a checkbox list at the end of the document.
 */
function addTaskList() {
  const docId = DocumentApp.getActiveDocument().getId();
  const doc = Docs.Documents.get(docId);

  // Find the end of the document
  const body = doc.body.content;
  const lastElement = body[body.length - 1];
  const endIndex = lastElement.endIndex - 1;

  const tasks = [
    'Review pull request',
    'Update documentation',
    'Run tests',
    'Deploy to staging'
  ];

  createCheckboxList(docId, endIndex, tasks);
  Logger.log('Checkbox list added');
}
