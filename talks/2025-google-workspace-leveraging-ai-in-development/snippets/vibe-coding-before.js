const sheets = SpreadsheetApp.getActiveSpreadsheet();

const projectSheet = sheets.getSheetByName("Projects");
const archiveSheet = sheets.getSheetByName("Archive");

const data = projectSheet.getDataRange().getValues();

// Reversed to avoid issues with changing row indices
for (let i = data.length - 1; i >= 0; i--) {
  const row = data[i];
  if (row[3] === "Completed") {
    archiveSheet.appendRow(row);
    projectSheet.deleteRow(i + 1); // 1-indexed
  }
}
