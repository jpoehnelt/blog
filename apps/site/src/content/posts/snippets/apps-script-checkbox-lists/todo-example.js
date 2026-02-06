/**
 * To-Do List Manager with menu
 */
function onOpen() {
  DocumentApp.getUi()
    .createMenu('✅ Tasks')
    .addItem('Add Task List', 'showTaskPrompt')
    .addItem('Convert to Checkboxes', 'convertToCheckboxes')
    .addToUi();
}

/**
 * Prompts user for tasks and creates a checkbox list.
 */
function showTaskPrompt() {
  const ui = DocumentApp.getUi();
  const response = ui.prompt(
    'Add Tasks',
    'Enter tasks (one per line):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const tasks = response.getResponseText()
      .split('\n')
      .filter(t => t.trim());

    if (tasks.length > 0) {
      const docId = DocumentApp.getActiveDocument().getId();
      const doc = Docs.Documents.get(docId);
      const endIndex = doc.body.content.slice(-1)[0].endIndex - 1;

      createCheckboxList(docId, endIndex, tasks);
      ui.alert(`Added ${tasks.length} tasks`);
    }
  }
}

/**
 * Converts selected text to a checkbox list.
 */
function convertToCheckboxes() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (!selection) {
    DocumentApp.getUi().alert('Please select text first');
    return;
  }

  const docId = doc.getId();
  const elements = selection.getRangeElements();

  // Get the range of the selection
  const firstEl = elements[0].getElement();
  const lastEl = elements[elements.length - 1].getElement();

  // This is simplified - full implementation would need precise indices
  DocumentApp.getUi().alert(
    'Selection detected. Use Docs API with precise indices to convert.'
  );
}
