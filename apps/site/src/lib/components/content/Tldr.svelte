<!--
@component Tldr
A "Too Long; Didn't Read" summary component with a green left border.

@usage
⚠️ **CRITICAL**: When using in MDX/markdown files, you MUST include blank lines
before and after the content for markdown processing to work correctly.

✅ CORRECT:
```markdown
<Tldr>

tl;dr I finished the [race](https://example.com) in **4 hours**.

</Tldr>
```

❌ INCORRECT:
```markdown
<Tldr>
tl;dr I finished the [race](https://example.com) in **4 hours**.
</Tldr>
```

Without blank lines, markdown syntax will render as plain text instead of being processed.

@example
```svelte
<Tldr>

**Summary:** Check out the [full article](/posts/example) for details.

</Tldr>
```
-->
<div class="tldr my-4 p-4 border-l-4 rounded-r border-green-500 bg-green-50 dark:bg-green-950/20">
  <slot />
</div>

<style>
  .tldr > :global(:first-child) {
    margin-top: 0;
  }

  .tldr > :global(:last-child) {
    margin-bottom: 0;
  }
</style>
