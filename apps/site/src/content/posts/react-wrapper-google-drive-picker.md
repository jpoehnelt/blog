---
title: React Wrapper for Google Drive Picker
description: Announcing the new React component for the Google Drive Picker, wrapping usage of the web component for easier integration.
pubDate: "2025-12-17"
tags: "google workspace,drive,picker,react,web component"
---

I've published a new package, [`@googleworkspace/drive-picker-react`](https://www.npmjs.com/package/@googleworkspace/drive-picker-react), to make it easier to use the Google Drive Picker in React applications.

As the creator of the underlying [`@googleworkspace/drive-picker-element`](https://www.npmjs.com/package/@googleworkspace/drive-picker-element) web component, I wanted to provide a seamless experience for React developers who might find integrating web components a bit verbose due to the need for manual event listeners and ref handling.

This package wraps the web component, providing a standard React interface with props and event handlers.

## Features

- **Typed Props**: Full TypeScript support for all Picker options.
- **Event Handling**: Standard `onPicked` and `onCanceled` props instead of adding event listeners.
- **SSR Compatible**: Designed to work with Next.js and other SSR frameworks (using client-side directives or dynamic imports).

## Usage

### Installation

```sh
npm install @googleworkspace/drive-picker-react
```

### Example

```tsx
import {
  DrivePicker,
  DrivePickerDocsView,
} from "@googleworkspace/drive-picker-react";

function App() {
  return (
    <DrivePicker
      clientId="YOUR_CLIENT_ID"
      appId="YOUR_APP_ID"
      onPicked={(e) => console.log("Picked:", e.detail)}
      onCanceled={() => console.log("Picker was canceled")}
    >
      <DrivePickerDocsView starred={true} />
    </DrivePicker>
  );
}
```

## Links

- [NPM Package](https://www.npmjs.com/package/@googleworkspace/drive-picker-react)
- [GitHub Repository](https://github.com/googleworkspace/drive-picker-element)
