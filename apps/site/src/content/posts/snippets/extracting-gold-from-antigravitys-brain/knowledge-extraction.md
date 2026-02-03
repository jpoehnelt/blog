# Knowledge Extraction Workflow

Extract challenges and patterns from past conversations/walkthroughs
into project rules.

## Prerequisites

- Access to `~/.gemini/antigravity` directory

## Steps

### 1. Find All Walkthroughs

// turbo

```bash
find ~/.gemini/antigravity/brain -name "walkthrough.md" -type f 2>/dev/null
```

### 2. Read Each Walkthrough

For each walkthrough found, read and extract:

- **Challenges encountered** (errors, gotchas, blockers)
- **Patterns established** (reusable solutions)
- **Learnings** (things that were discovered)

Look specifically for sections like:

- "Challenges & Learnings"
- "Key Patterns Established"
- "Discovery" or "Learning" annotations
- "Problem" / "Solution" pairs

### 3. Categorize Findings

Group extracted knowledge by domain:

| Domain           | Target Rule File           |
| ---------------- | -------------------------- |
| Svelte/SvelteKit | `.agent/rules/svelte.md`   |
| API/Services     | `.agent/rules/api.md`      |
| Database/Drizzle | `.agent/rules/database.md` |
| Task YAML        | `.agent/rules/tasks.md`    |
| Design System    | `.agent/rules/design.md`   |
| Firmware/Rust    | `.agent/rules/style.md`    |
| Flutter/Mobile   | `.agent/rules/flutter.md`  |
| Packages/Modular | `.agent/rules/packages.md` |

### 4. Check Knowledge Items

// turbo

```bash
ls ~/.gemini/antigravity/knowledge/
```

Read relevant knowledge item metadata for additional context:

```bash
cat ~/.gemini/antigravity/knowledge/<item>/metadata.json
```

### 5. Update Rules Files

For each finding:

1. **Check if already documented** in target rule file
2. **Add if new** — include code examples where applicable
3. **Use consistent format**:
   - Problem description
   - Code example (wrong vs correct)
   - Impact or reason

### 6. Create Summary Artifact

Create a summary in the current conversation's brain artifacts:

```
~/.gemini/antigravity/brain/<conversation-id>/challenges_summary.md
```

Include:

- Challenges found (categorized)
- Rules updated
- Patterns extracted

### 7. Commit Changes

```bash
git add .agent/rules/
git commit -m "docs: update rules from knowledge extraction

- [list specific rules updated]
- [list key patterns added]"
```

## When to Run This Workflow

- **Weekly**: Quick scan for new learnings
- **After major sessions**: Extract patterns from complex work
- **Before major refactors**: Ensure rules capture current best practices
- **New team member onboarding**: Verify rules are comprehensive

## Output

- Updated rule files in `.agent/rules/`
- Challenges summary artifact
- Commit documenting changes
