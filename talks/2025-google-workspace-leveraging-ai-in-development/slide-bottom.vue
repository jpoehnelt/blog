<script setup lang="ts">
import { useSlideContext } from "@slidev/client";
import { computed } from "vue";

const { $nav, $slidev, $frontmatter } = useSlideContext();

const svg = computed<string>(
  () => $frontmatter.svg ?? $slidev.configs.defaults.svg,
);
</script>

<template>
  <footer>
    <div v-if="$nav.currentPage > 1">
      <div class="absolute top-2 right-4 text-xs text-gray-400 p-2">
        {{ $nav.currentPage }}
      </div>
      <GoogleWorkspace_Grey400 v-if="svg !== 'bottom-full'" />
      <GoogleSVGBottomFull v-if="svg === 'bottom-full'" />
      <GoogleSVGBottomLeft v-if="svg === 'bottom-left'" />
    </div>
    <div v-else>
      <GoogleWorkspaceLogo_FullColor />

      <GoogleSVGBottomFull />
    </div>
  </footer>
</template>
