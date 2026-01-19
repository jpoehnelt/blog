## 2024-05-23 - Accessibility in Svelte Components

**Learning:** Common interactive components like Copy buttons often miss state announcements for screen readers.
**Action:** When state changes visually (icon swap), ensure text alternative also updates (e.g., "Copy" -> "Copied!").

## 2026-01-19 - Semantic HTML and Icons

**Learning:** Converting list components (`ActivityListItem`, `PostListItem`) from `div` to `li` requires strictly checking all consumers. Consumers manually iterating over these items (e.g., in `+page.svelte`) must update their wrapper from `div` to `ul`/`ol` to maintain valid HTML.
**Learning:** For `@lucide/svelte` in this workspace, use the scoped import `import { IconName } from "@lucide/svelte"` to avoid build resolution errors.
**Action:** Replaced inline SVGs with standard `ExternalLinkIcon` from `@lucide/svelte` to reduce code duplication and enforce consistency.
