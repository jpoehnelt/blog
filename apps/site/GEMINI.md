# Site Project Context

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (Runes). https://svelte.dev/llms-full.txt
- **Styling**: Tailwind CSS v4 with Shadcn Svelte.
- **Content**: `mdsvex` for Markdown processing.
- **Visualization**: `layerchart` (D3 wrapper) for charts and maps.
- **Icons**: `lucide-svelte` and `simple-icons`.

## Development (`apps/site`)

See root `GEMINI.md` for global workflow.

- **Dev**: `pnpm --filter site dev`
- **Build**: `pnpm --filter site build`
- **Check**: `pnpm --filter site check`

## Structure

- `src/routes`: Pages and API endpoints.
- `src/lib`: Shared components/utils.
- `src/content/posts`: Blog posts (Markdown).

## Conventions

- **Svelte 5**: Use Runes (`$state`, `$derived`, `$props`). No `export let`.
- **Tailwind v4**: Use v4 syntax.
- **Strict TypeScript**: No `any`.
