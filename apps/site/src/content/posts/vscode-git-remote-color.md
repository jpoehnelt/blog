---
title: VS Code Git Remote Color
description: Automatically colorize your VS Code window based on the git remote.
pubDate: "2026-02-09"
tags:
  - code
  - vscode
  - git
  - productivity
  - open source
  - color
  - antigravity
---

<script>
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

I wrote this extension over the weekend to solve a simple but annoying problem: I often have way too many VS Code windows open and lose track of which repo is which. So I built **vscode-git-remote-color**.

## How it works

The extension is pretty simple. It takes the git remote URL of your current workspace, hashes it, and generates a unique color. It then applies this color to the window's status bar.

If you have multiple windows open for the same repo (maybe different branches), they'll have the same color. If you switch to a different repo, you get a new color.

My `settings.json` looks like this after installing the extension:

```json
{
  "workbench.colorCustomizations": {
    "statusBar.background": "#339992",
    "statusBar.foreground": "#15202b",
    "sash.hoverBorder": "#339992"
  }
}
```

## Features

- **Automatic Coloring**: No configuration needed. It just works.
- **Consistent Hashing**: The same remote will always generate the same color.
- **Unobtrusive**: It adds a splash of color without being distracting.

## Get it

You can install it directly from the Open VSX Registry or the VS Code Marketplace.

<Note>

Check it out on Open VSX: [vscode-git-remote-color](https://open-vsx.org/extension/jpoehnelt/vscode-git-remote-color)

</Note>

Or install it from the command line:

```bash
code --install-extension jpoehnelt.vscode-git-remote-color
```

## Source

The code is open source and available on GitHub. If you have ideas for improvements or features,feel free to open an issue or PR!

[https://github.com/jpoehnelt/vscode-git-remote-color](https://github.com/jpoehnelt/vscode-git-remote-color)
