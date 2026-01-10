## 2024-05-23 - Avoiding Prop Mutation and Unnecessary Sorting

**Learning:** `Array.prototype.sort()` mutates the array in place. In Svelte (especially with Runes or `$derived`), sorting a prop directly can cause unexpected side effects or mutations in the parent component. Additionally, sorting (O(N log N)) to find a minimum/maximum value (O(N)) is inefficient.
**Action:** Use `Math.min`/`Math.max` or `reduce` (O(N)) to find extremes. If sorting is needed for display, ensure a copy is made (e.g., `[...data].sort()`) or use `toSorted()` if available, to avoid mutating props.
