## 2025-05-20 - Pinning GitHub Actions for Supply Chain Security
**Learning:** Using mutable tags like `@v4` or `@latest` exposes the build pipeline to supply chain attacks and unexpected breaking changes. If a malicious actor compromises the tag or the author pushes a breaking change, the CI could fail or be exploited.
**Action:** Always pin actions to their full SHA hash (e.g., `actions/checkout@11bd71...`) and add a comment with the version (e.g., `# v4.2.2`). This ensures immutability and reproducibility.
