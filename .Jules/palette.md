## 2024-05-24 - Consistent Focus States
**Learning:** Inconsistent keyboard navigation cues (focus rings) can disorient users. While `Navbar` had robust focus styles, list items and tags relied on browser defaults which were often invisible or inconsistent.
**Action:** When adding interactive elements, always verify they inherit the design system's focus styles (`focus-visible:ring-...`) rather than relying on defaults.
