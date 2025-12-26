---
title: Google Workspace Developer Tools VS Code Extension
description: >-
  Announcing the new Google Workspace Developer Tools extension for VS Code,
  working with Antigravity and providing OAuth2 scope linting and MCP support.
pubDate: '2025-12-16'
tags:
  - google workspace
  - vscode
  - developer tools
  - mcp
  - scopes
  - oauth
syndicate: true
devto:
  id: 3114476
  link: >-
    https://dev.to/googleworkspace/google-workspace-developer-tools-vs-code-extension-g6n
  status: published
medium:
  id: ed92c29a2f51
  link: 'https://medium.com/@jpoehnelt/ed92c29a2f51'
  status: draft
---

I recently released the [Google Workspace Developer Tools VS Code extension](https://marketplace.visualstudio.com/items?itemName=google-workspace.google-workspace-developer-tools) to help developers with OAuth2 scope management and AI assistance.

<img src="/images/scope-completion.gif" alt="OAuth2 Scope Linting & Completions" />

## Features

### OAuth2 Scope Intelligence

The extension validates and documents Google Workspace OAuth2 scopes directly in your code. It provides real-time validation for invalid scopes, security classifications for restricted/sensitive scopes, and hover documentation with API details. It supports all Google Workspace APIs.

### MCP (Model Context Protocol) Server

It also includes an MCP server for AI-powered development, allowing correct access to API documentation and context-aware suggestions.

## Links

- [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=google-workspace.google-workspace-developer-tools)
- [Open VSX Registry](https://open-vsx.org/extension/google-workspace/google-workspace-developer-tools)
- [GitHub Repository](https://github.com/googleworkspace/developer-tools/tree/main/packages/vscode-extension)
- [Google Workspace Developer Tools Guide](https://developers.google.com/workspace/guides/developer-tools)
