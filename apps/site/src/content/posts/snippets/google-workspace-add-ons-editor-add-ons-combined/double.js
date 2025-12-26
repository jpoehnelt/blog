const projectsUrl = "https://script.googleapis.com/v1/projects";

// for alt runtime see token in
// https://developers.google.com/workspace/add-ons/guides/alternate-runtimes
const accessToken = ScriptApp.getOAuthToken();
const headers = {
  Authorization: `Bearer ${accessToken}`,
};

// Create container bound script project
// Note: There can be multiple projects per file
// Note: There is no way to list existing projects,
//   https://issuetracker.google.com/111149037
const response = UrlFetchApp.fetch(projectsUrl, {
  method: "post",
  contentType: "application/json",
  payload: JSON.stringify({
    title: "_addon",
    parentId: SpreadsheetApp.getActiveSpreadsheet().getId(),
  }),
  headers,
});

const { scriptId } = JSON.parse(response.getContentText());

// TODO persist scriptId for future updates

Logger.info(`created script: ${scriptId}`);

// Create files in container bound project, manifest is required
const files = [
  {
    source: `// DO NOT EDIT
/**
 * Multiplies an input value by 2.
 * @param {number} input The number to double.
 * @return The input multiplied by 2.
 * @customfunction
*/
function DOUBLE(input) {
  return input * 2;
}

/**
 * The event handler triggered when opening the spreadsheet.
 * @param {Event} e The onOpen event.
 * @see https://developers.google.com/apps-script/guides/triggers#onopene
 * @OnlyCurrentDoc
 */
function onOpen(e) {
  // Add a custom menu to the spreadsheet.
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
      .createMenu('Custom Menu')
      .addItem('Hello', 'hello')
      .addToUi();
}

function hello() {
  Browser.msgBox('Hello from custom menu');
}
  `,
    name: "test",
    type: "SERVER_JS",
  },
  {
    name: "appsscript",
    type: "JSON",
    source: JSON.stringify(
      {
        timeZone: "America/New_York",
        exceptionLogging: "STACKDRIVER",
        runtimeVersion: "V8",
      },
      null,
      2,
    ),
  },
];

UrlFetchApp.fetch(`${projectsUrl}/${scriptId}/content`, {
  method: "put",
  contentType: "application/json",
  payload: JSON.stringify({
    files,
  }),
  headers,
});
