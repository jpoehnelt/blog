## 2024-05-23 - Accessibility in Svelte Components
**Learning:** Common interactive components like Copy buttons often miss state announcements for screen readers.
**Action:** When state changes visually (icon swap), ensure text alternative also updates (e.g., "Copy" -> "Copied!").

## 2025-05-28 - Decorative Separators
**Learning:** Text separators like bullets (•) are read aloud by screen readers, creating a cluttered auditory experience.
**Action:** Always wrap decorative text separators in `<span aria-hidden="true">` to hide them from assistive technology.
