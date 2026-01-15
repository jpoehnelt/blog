---
title: "Building a MCP Client in Google Apps Script"
description: "Learn how to communicate with Model Context Protocol (MCP) servers using Apps Script and UrlFetchApp. Incorporate the MCP client into Vertex AI tool calling."
pubDate: "2026-01-15"
tags:
  - mcp
  - apps script
  - google workspace
  - vertex ai
  - gemini
  - code
faq: 
  - question: Can I use `stdio` or `sse` MCP servers?
    answer: No. `stdio` doesn't work because Apps Script is in the cloud and `sse` or HTTP Server Sent Events are not supported in Apps Script `UrlFetchApp`.
  - question: How do I authenticate the MCP server?
    answer: You should to use servers that support key-based or long lived tokens in headers. Google MCP servers might support the Apps Script OAuth token if you have the correct scopes defined! See [Secure Secrets in Apps Script](/posts/secure-secrets-google-apps-script/).
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
  import Image from '$lib/components/content/Image.svelte';
</script>

The **Model Context Protocol (MCP)** is an open standard that allows AI assistants and tools to interact securely. While there are official SDKs for Node.js and Python, you might sometimes need a lightweight connection from a Google Workspace environment.

In this post, we'll build a minimal MCP client using Google Apps Script's `UrlFetchApp`.

## Understanding the Protocol

MCP uses [JSON-RPC 2.0](https://www.jsonrpc.org/specification) for communication. A typical session lifecycle involves:

1.  **Initialization**: Handshake to exchange capabilities.
2.  **Tool Discovery**: Listing available tools.
3.  **Tool Execution**: Calling specific tools to perform actions.

<Note>

This implementation assumes you have an MCP server exposed via HTTP. I'm using the [Google Workspace Developer Tools MCP Server](https://github.com/googleworkspace/developer-tools) for this example, `https://workspace-developer.goog/mcp`.

</Note>

## The Code

Here is the `McpClient` class that handles the handshake and method calls.

<Snippet src="./snippets/mcp-client-apps-script/mcp-client.gs" />

And here is how you can use it:

<Snippet src="./snippets/mcp-client-apps-script/main.gs" />

### 1. Initialization (Handshake)

The session starts with an `initialize` request. The client sends its protocol version and capabilities. The server responds with its own.

```
9:59:38 AM	Info	Initializing...
9:59:38 AM	Info	Capabilities: {
  "protocolVersion": "2024-11-05",
  "capabilities": {
    "experimental": {},
    "prompts": {
      "listChanged": false
    },
    "resources": {
      "subscribe": false,
      "listChanged": false
    },
    "tools": {
      "listChanged": false
    }
  },
  "serverInfo": {
    "name": "Google Workspace Developers",
    "version": "unknown"
  },
  "instructions": "First, use the search_workspace_docs tool..."
}
```

### 2. Listing Tools

Once initialized, we can see what the server offers using `tools/list`.

```
9:59:38 AM	Info	Available Tools: {
  "tools": [
    {
      "name": "search_workspace_docs",
      "title": "Search Google Workspace Documentation",
      "description": "Searches the latest official Google Workspace doc...",
      "inputSchema": {
        "properties": {
          "query": {
            "description": "The query to search.",
            "maxLength": 100,
            "minLength": 5,
            "title": "Query",
            "type": "string"
          }
        },
        "required": [
          "query"
        ],
        "title": "search_toolArguments",
        "type": "object"
      },
      "outputSchema": {
        "$defs": {
          "SearchResult": {
            "properties": {
              "title": {
                "description": "The title of the search result.",
                "title": "Title",
                "type": "string"
              },
              "url": {
                "description": "The URL of the search result.",
                "title": "Url",
                "type": "string"
              }
            },
            "required": [
              "title",
              "url"
            ],
            "title": "SearchResult",
            "type": "object"
          }
        },
        "properties": {
          "results": {
            "description": "The search results.",
            "items": {
              "$ref": "#/$defs/SearchResult"
            },
            "title": "Results",
            "type": "array"
          },
          "summary": {
            "description": "The summary of the search results.",
            "title": "Summary",
            "type": "string"
          }
        },
        "required": [
          "results",
          "summary"
        ],
        "title": "SearchResponse",
        "type": "object"
      },
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": true,
        "openWorldHint": true
      }
    },
```

### 3. Calling Tools

To use a capability, we send a `tools/call` request with the tool name and arguments.

```javascript
const toolName = tools.tools[0].name;
const result = client.callTool(toolName, { query: "Apps Script" });
console.log("Result:", JSON.stringify(result, null, 2));
```

And the result looks like this:

```
10:03:47 AM	Info	Result: {
  "content": [
    {
      "type": "text",
      "text": "{\n  \"results\": [\n    {\n   ..."
    }
  ],
  "structuredContent": {
    "results": [
      {
        "title": "Google Apps Script overview",
        "url": "https://developers.google.com/apps-script/overview"
      },
      // ...OMITTED
      {
        "title": "Manifests",
        "url": "https://developers.google.com/apps-script/concepts/manifests"
      }
    ],
    "summary": "Apps Script enhances Google Workspace. It adds..."
  },
  "isError": false
}
```


## Integrating with Vertex AI

One of the most powerful uses of MCP is giving LLMs access to your tools. Since MCP uses JSON Schema for tool definitions, we can easily adapt them for Vertex AI function calling.

<Snippet src="./snippets/mcp-client-apps-script/vertex.gs" />

### OAuth Scopes

To use Vertex AI, you must explicitly add the `cloud-platform` scope to your `appsscript.json`. If you use `UrlFetchApp`, you also need `script.external_request`.

<Snippet src="./snippets/mcp-client-apps-script/appsscript.json" />

<Note>

Apps Script recently released a built-in [Vertex AI Advanced Service](/posts/using-gemini-in-apps-script). You can use that instead of `UrlFetchApp` for a cleaner experience, but the REST API approach shown above works everywhere.

</Note>


### Vertex AI MCP Tool Calling

Here is what the code looks like to call the MCP server from Vertex AI in Apps Script. 

1. The initial Vertex AI call contains the tool definitions from the MCP `tools/list` call. 
1. The model then returns the function calls and params.
1. Another Vertex AI call is made with the tool result(now without allowing tools).
1. Gemini via the Vertex AI summarizes the content (`user`, `model`, `tool`) into another output.

<Image src="mcp-vertex-ai-tool-call.png" alt="Vertex AI Tool Call from MCP Server in Apps Script" />

## Sumamry

This simple wrapper allows Google Apps Script to act as an MCP Client, enabling you to integrate your Workspace automation directly with the growing ecosystem of MCP servers.

## Further Reading

- [MCPApp](https://github.com/tanaikech/MCPApp): A MCP client/server library for Apps Script by Kanshi Tanaike.
- [Connect Gemini to Google Apps Script via MCP](https://dev.to/googleworkspace/apps-script-mcp-server-3lo5): A guide on building an MCP Server in Apps Script.
- [Vertex AI Advanced Service](https://developers.google.com/apps-script/advanced/vertex-ai): The Vertex AI Advanced Service for Apps Script.
