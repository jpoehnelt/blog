/**
 * A simple MCP Client for Google Apps Script.
 * Uses UrlFetchApp to communicate via JSON-RPC 2.0.
 */
class McpClient {
  constructor(url) {
    this.url = url;
    this.sessionId = null;
    this.requestId = 1;
  }

  /**
   * Initializes the session and captures the session ID.
   */
  initialize() {
    const response = this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        roots: { listChanged: false },
        sampling: {},
      },
      clientInfo: {
        name: "AppsScriptClient",
        version: "1.0.0",
      },
    });

    this.sendNotification("notifications/initialized");
    return response;
  }

  /**
   * Lists available tools.
   */
  listTools() {
    return this.sendRequest("tools/list", {});
  }

  /**
   * Calls a specific tool.
   * @param {string} name
   * @param {Object} args
   */
  callTool(name, args) {
    return this.sendRequest("tools/call", {
      name: name,
      arguments: args || {},
    });
  }

  /**
   * Closes the session.
   */
  close() {
    if (!this.sessionId) return;

    const options = {
      method: "delete",
      headers: {
        "MCP-Session-Id": this.sessionId,
      },
      muteHttpExceptions: true,
    };

    UrlFetchApp.fetch(this.url, options);
    this.sessionId = null;
  }

  /**
   * Sends a JSON-RPC request.
   */
  sendRequest(method, params) {
    const payload = {
      jsonrpc: "2.0",
      id: String(this.requestId++),
      method: method,
    };
    if (params !== undefined) {
      payload.params = params;
    }

    const options = {
      method: "post",
      contentType: "application/json",
      headers: this._getHeaders(),
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(this.url, options);

    // Capture session ID from initialization response if not already set
    if (!this.sessionId && method === "initialize") {
      const respHeaders = response.getHeaders();
      // Headers might be case-insensitive or not, check both standard casing
      this.sessionId =
        respHeaders["MCP-Session-Id"] || respHeaders["mcp-session-id"];
    }

    const contentType = response.getHeaders()["Content-Type"] || "";

    let json;

    if (contentType.includes("text/event-stream")) {
      const content = response.getContentText();
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.substring(6));
            if (
              data.id === payload.id ||
              data.result !== undefined ||
              data.error !== undefined
            ) {
              json = data;
              break;
            }
          } catch (e) {
            // ignore parse errors for keep-alive or malformed lines
          }
        }
      }
      if (!json) {
        throw new Error("No valid JSON-RPC response in event stream");
      }
    } else {
      json = JSON.parse(response.getContentText());
    }

    if (json.error) {
      throw new Error(`MCP Error ${json.error.code}: ${json.error.message}`);
    }

    return json.result;
  }

  /**
   * Sends a JSON-RPC notification (no id, no response expected).
   */
  sendNotification(method, params) {
    const payload = {
      jsonrpc: "2.0",
      method: method,
      params: params,
    };

    const options = {
      method: "post",
      contentType: "application/json",
      headers: this._getHeaders(),
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    UrlFetchApp.fetch(this.url, options);
  }

  /**
   * Helper to construct headers.
   */
  _getHeaders() {
    const headers = {
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2024-11-05",
    };

    if (this.sessionId) {
      headers["MCP-Session-Id"] = this.sessionId;
    }
    return headers;
  }
}
