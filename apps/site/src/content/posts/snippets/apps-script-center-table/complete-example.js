/**
 * Creates a centered table in a new document.
 */
function createCenteredTable() {
  const doc = DocumentApp.create('Centered Table Demo');
  const body = doc.getBody();

  body.appendParagraph('This table is centered:');
  body.appendTable([
    ['Name', 'Email'],
    ['Alice', 'alice@example.com'],
    ['Bob', 'bob@example.com']
  ]);

  doc.saveAndClose();

  // Center the table
  const docId = doc.getId();
  const docData = Docs.Documents.get(docId);

  for (const element of docData.body.content) {
    if (element.table) {
      centerTable(docId, element.startIndex);
      break;
    }
  }

  Logger.log(`Created: ${doc.getUrl()}`);
}

/**
 * Adds a menu for table alignment.
 */
function onOpen() {
  DocumentApp.getUi()
    .createMenu('📊 Table')
    .addItem('Center Table', 'centerFirstTable')
    .addItem('Set Custom Widths', 'setCustomWidths')
    .addToUi();
}
