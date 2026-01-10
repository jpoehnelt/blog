# Writing Style Guide

## Voice and Tone

- **First-Person**: Write in the first person ("I", "me", "my"). Share personal experiences and perspectives.
- **Authentic and Personal**: Be genuine and relatable. Use a conversational but professional tone.
- **Helpful and Informative**: The primary goal is to share knowledge or experience. Explain complex concepts clearly.
- **Concise**: Keep paragraphs short and to the point. Avoid unnecessary fluff.
- **Engaging**: Use hooks in the introduction to grab the reader's attention.

## Structure and Formatting

- **Headings**: Use `##` for main sections and `###` for subsections. Avoid using single `#` for sections (reserved for title, though typically handled by the layout).
- **Paragraphs**: Keep them short (1-3 sentences preferred).
- **Lists**: Use bullet points or numbered lists to break up dense text.
- **Emphasis**: Use **bold** for key terms or emphasis. Use _italics_ sparingly for stress or notes.
- **Links**: Use descriptive link text. Link to official documentation or authoritative sources when relevant.

## Technical Content

- **Code Blocks**: Always specify the language for syntax highlighting (e.g., \`\`\`javascript, \`\`\`sh, \`\`\`rust).
- **Snippets**: Include relevant code snippets to illustrate points.
- **Accuracy**: Ensure all technical details and code examples are accurate.

## Custom Components

Use Svelte components to enhance the content. Import them in a `<script>` tag at the top of the file (after frontmatter).

### Note

Use for asides, warnings, or important highlights.

**CRITICAL**: You MUST include blank lines before and after the content for markdown processing to work correctly.

```html
<script>
  import Note from "$lib/components/content/Note.svelte";
</script>

<Note> **Important:** Make sure to read the [documentation](/docs). </Note>
```

### Image

Use for embedding images with optimization.

The `src` prop maps to images in the `src/lib/images/` directory. You can provide the filename directly (if unique) or the path relative to `src/lib/images/` or `src/images/`.

```html
<script>
  import Image from "$lib/components/content/Image.svelte";
</script>

<image src="image-filename.png" alt="Descriptive alt text" />
```

### Tldr

Use for a "Too Long; Didn't Read" summary at the top of long posts.

**CRITICAL**: You MUST include blank lines before and after the content for markdown processing to work correctly.

```html
<script>
  import Tldr from "$lib/components/content/Tldr.svelte";
</script>

<Tldr>
  **Summary:** Check out the [full article](/posts/example) for details.
</Tldr>
```

### Snippet

Use to display a code snippet from a file, with a link to GitHub.

- `src`: Path to the snippet file (e.g., `snippets/my-code.js`).
- `description`: Optional description.
- `githubUrl`: Optional URL to the file on GitHub.
- `rawContent` and `code`: Usually populated by build tools/plugins.

```html
<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

<Snippet src="snippets/example.js" description="Example Code" />
```

### Strava

Use to embed a Strava activity.

- `id`: The Strava activity ID (required).
- `embed`: The embed token (optional, defaults to a specific hash).

```html
<script>
  import Strava from "$lib/components/content/Strava.svelte";
</script>

<Strava id="1234567890" />
```

### GoogleDisclaimer

This component is **automatically added** to the bottom of posts that include tags related to Google (e.g., `google`, `apps script`, `google workspace`, `gmail`). You do not need to manually add it to your posts.

## Specific Conventions

- **Dates**: Use ISO 8601 format (YYYY-MM-DD) for `pubDate`.

## SEO Guidelines

- **Titles**:
  - Keep titles under 60 characters to avoid truncation in search results.
  - Preferred length is < 50 characters to allow for brand suffix (e.g., " - Brand Name").
  - Be descriptive but concise.
- **Descriptions**:
  - Keep descriptions under 160 characters.
  - Summarize the content and include a call to action or hook.
  - Avoid duplicate descriptions across posts.
