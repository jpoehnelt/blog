## 2024-05-23 - Accessibility of decorative separators and icon-only links
**Learning:** Decorative text elements like "•" in lists are announced by screen readers, creating noise (e.g., "Bullet"). Icon-only links without `aria-label` are inaccessible.
**Action:** Wrap decorative text separators in `<span aria-hidden="true">` and ensure all icon-only links have `aria-label` and `aria-hidden="true"` on the SVG.
