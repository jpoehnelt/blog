---
title: Google Workspace Developer Tools MCP Server
description: >-
  Announcing the new MCP server for Google Workspace Developer Tools, providing
  AI agents with access to official documentation and API snippets.
pubDate: "2025-12-17"
tags:
  - google workspace
  - mcp
  - ai
  - gemini
  - developer tools
syndicate: true
devto:
  id: 3114475
  link: >-
    https://dev.to/googleworkspace/google-workspace-developer-tools-mcp-server-723
  status: published
medium:
  id: b73cd0e1710d
  link: "https://medium.com/@jpoehnelt/b73cd0e1710d"
  status: draft
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

Following the release of the [VS Code extension](/posts/google-workspace-developer-tools-vscode-extension), I've also published a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server for Google Workspace Developers.

This server provides AI agents with context-aware access to Google Workspace developer documentation, enabling them to retrieve up-to-date information about APIs, services, and code snippets.

## Features

### Documentation Access

The MCP server allows LLMs and AI agents to search and retrieve official Google Workspace documentation. This ensures that the AI answers your questions using the latest guides and best practices, rather than outdated training data.

You can use it to:

- Retrieve up-to-date information about Google Workspace APIs.
- Fetch code snippets and examples.
- Understand concepts and limitations of specific services.

## Usage

### Gemini CLI

If you are using the [Gemini CLI](https://geminicli.com/), the MCP server is automatically included when you install the developer tools extension:

```sh
gemini extensions install https://github.com/googleworkspace/developer-tools
```

### Gemini Code Assist & Other Clients

For other MCP clients, you can configure the server manually.

For **Gemini**, add this to your `settings.json`:

<Snippet src="./snippets/google-workspace-developer-tools-mcp-server/mcp-config.json" />

## Links

- [Google Workspace Developer Tools Guide](https://developers.google.com/workspace/guides/developer-tools#mcp)
- [GitHub Repository](https://github.com/googleworkspace/developer-tools)
- [Model Context Protocol](https://modelcontextprotocol.io/)
