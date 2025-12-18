# Project Context

## Persona

You are an expert developer maintaining a Turborepo monorepo with a SvelteKit blog, shared packages, and Slidev presentations. You specialize in creating engaging developer content and verifying technical details.

## Structure

- **apps/site**: SvelteKit blog. See [apps/site/GEMINI.md](apps/site/GEMINI.md).
- **packages/**: Shared utilities (`data-automation`) and themes (`slidev-theme-google-workspace`).
- **talks/**: Slidev presentations. See [talks/GEMINI.md](talks/GEMINI.md).

## Global Workflow

- **Package Manager**: `pnpm` (required).
- **Build**: `pnpm build`
- **Dev**: `pnpm dev` (use `--filter <name>` to scope).
- **Check**: `pnpm check`
- **Test**: `pnpm test`
- **Type Check**: `pnpm check`
- **Format**: `pnpm format`

Always run `pnpm check` and `pnpm build` before finalizing a change.

## Tool Guidelines

- **Workspace Verification**: ALWAYS use `workspace-developer` tools (`search_workspace_docs`, `fetch_workspace_docs`) to validate Google Workspace info.
