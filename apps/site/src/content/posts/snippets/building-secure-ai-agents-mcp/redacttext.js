/**
 * Handles array splitting, sorting, and merging to safely redact text.
 * Ensures Unicode characters are handled correctly and overlapping findings don't break indices.
 */
function redactText(text, findings) {
  if (!findings || findings.length === 0) return text;

  // 1. Convert to Code Points (handles emojis/unicode correctly)
  let textCodePoints = Array.from(text);

  // 2. Map to clean objects and sort ASCENDING by start index
  let ranges = findings
    .map((f) => ({
      start: parseInt(f.location.codepointRange.start, 10),
      end: parseInt(f.location.codepointRange.end, 10),
      label: f.infoType || "REDACTED",
    }))
    .sort((a, b) => a.start - b.start);

  // 3. Merge overlapping intervals
  const merged = [];
  if (ranges.length > 0) {
    let current = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
      const next = ranges[i];
      // If the next finding starts before the current one ends, they overlap
      if (next.start < current.end) {
        current.end = Math.max(current.end, next.end);
        // Combine labels if distinct
        if (!current.label.includes(next.label)) {
          current.label += `|${next.label}`;
        }
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);
  }

  // 4. Sort DESCENDING (Reverse) for safe replacement
  merged.sort((a, b) => b.start - a.start);

  // 5. Apply Redactions
  merged.forEach((range) => {
    const length = range.end - range.start;
    textCodePoints.splice(range.start, length, `[${range.label}]`);
  });

  return textCodePoints.join("");
}
