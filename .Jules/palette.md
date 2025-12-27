## 2024-05-23 - Accessibility in Svelte Components

**Learning:** Common interactive components like Copy buttons often miss state announcements for screen readers.
**Action:** When state changes visually (icon swap), ensure text alternative also updates (e.g., "Copy" -> "Copied!").

## 2025-12-27 - Skip to Content Pattern

**Learning:** Adding a "Skip to Content" link is a high-impact, low-effort a11y win, but it requires the target container to be programmatically focusable (`tabindex="-1"`) so the focus doesn't get lost or reset.
**Action:** Always wrap the main content in a container with a predictable ID (e.g., `#main-content`) and `tabindex="-1"` when implementing skip links in layouts.
