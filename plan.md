1. **Goal**: Refactor the raw `<table>` implementations in `apps/site/src/routes/ultras/races/competitive/+page.svelte` and `apps/site/src/routes/ultras/races/[year]/+page.svelte` to use the Shadcn UI `Table` components (`$lib/components/ui/table`).
2. **Current State**: Both files use raw HTML `<table>`, `<thead>`, `<tr>`, `<th>`, `<tbody>`, `<td>` tags, mixed with TanStack Table logic.
3. **Target State**: Both files should import `* as Table from "$lib/components/ui/table"` and use `<Table.Root>`, `<Table.Header>`, `<Table.Row>`, `<Table.Head>`, `<Table.Body>`, and `<Table.Cell>`.
4. **Steps**:
    - Update imports in both `+page.svelte` files.
    - Replace raw table tags with their corresponding Shadcn UI components.
    - Preserve existing Tailwind classes where necessary (e.g., hidden states on specific columns) by passing them to the `class` prop of the Table components.
    - Verify the UI works by running the dev server.
5. **Pre-commit**: Run pre-commit instructions to ensure everything is proper.
