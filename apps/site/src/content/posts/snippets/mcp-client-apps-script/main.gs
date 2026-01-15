/**
 * A simple MCP Client for Google Apps Script.
 * Uses UrlFetchApp to communicate via JSON-RPC 2.0.
 */
function runMcpClientDemo() {
  // Replace with your MCP server URL
  const SERVER_URL = "https://workspace-developer.goog/mcp";
  const client = new McpClient(SERVER_URL);

  // 1. Initialize
  console.log("Initializing...");
  const initResult = client.initialize();
  console.log("Capabilities:", JSON.stringify(initResult, null, 2));

  // 2. List Tools
  console.log("Listing Tools...");
  const tools = client.listTools();
  console.log("Available Tools:", JSON.stringify(tools, null, 2));

  // 3. Call Tool
  if (tools.tools && tools.tools.length > 0) {
    const toolName = tools.tools[0].name;
    const result = client.callTool(toolName, { query: "Apps Script" });
    console.log("Result:", JSON.stringify(result, null, 2));
  }

  // 4. Close Session
  console.log("Closing session...");
  client.close();
}
