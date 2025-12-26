// src/lib/stores.ts
import { page } from "$app/stores";
import { derived } from "svelte/store";
import { slugToUUID } from "$lib/utils/uuid";

export const params = derived(page, ($page) => {
  return Object.fromEntries(
    Object.entries($page.params).map(([key, value]) => {
      // Convert slugs to UUIDs if ending in 'Id' or 'id' and 22 characters long
      if (/^(id|[a-zA-Z]+Id)$/.test(key) && value && value.length === 22) {
        value = slugToUUID(value);
      }
      return [key, value];
    }),
  );
});
