/**
 * Demonstrates using MCP tools with Vertex AI.
 */
function runVertexAiAgent() {
  const SERVER_URL = "https://workspace-developer.goog/mcp";
  const PROJECT_ID = "YOUR_PROJECT_ID";
  const LOCATION = "global";
  const MODEL_ID = "gemini-3-flash-preview";

  const client = new McpClient(SERVER_URL);
  client.initialize();

  // 1. Adapt MCP tools for Vertex AI
  const tools = client.listTools();
  const functionDeclarations = tools.tools.slice(0, 1).map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));

  // 2. Call the Model using Vertex AI Advanced Service
  const model =
    `projects/${PROJECT_ID}/locations/${LOCATION}` +
    `/publishers/google/models/${MODEL_ID}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "How do I call Gemini from Apps Script in two sentences.",
          },
        ],
      },
    ],
    tools: [{ functionDeclarations }],
    // Model is constrained to always predicting function calls only.
    toolConfig: { functionCallingConfig: { mode: "ANY" } },
  };

  const url = `https://aiplatform.googleapis.com/v1/${model}:generateContent`;
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  const content = json.candidates[0].content;
  const part = content.parts[0];

  // 3. Execute Tool Call
  if (part.functionCall) {
    const fn = part.functionCall;
    console.log(fn);
    const result = client.callTool(fn.name, fn.args);

    // 4. Call the Model again with the tool result
    payload.contents.push(content);
    payload.contents.push({
      role: "function",
      parts: [
        {
          functionResponse: {
            name: fn.name,
            response: { name: fn.name, content: result },
          },
        },
      ],
    });

    console.log("Payload now contains tool result");
    console.log(payload.contents);

    // Remove tools
    delete payload.tools;

    options.payload = JSON.stringify(payload);
    const response2 = UrlFetchApp.fetch(url, options);
    const answer = JSON.parse(response2.getContentText()).candidates[0].content
      .parts[0].text;
    console.log(answer);
  }

  // 5. Use it in a loop for agentic behavior
  // TODO(developer): Implement agent loop
}
