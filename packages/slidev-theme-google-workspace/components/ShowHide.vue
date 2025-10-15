<script setup lang="ts">
import type { ClicksContext } from "@slidev/types";

import { ref, onMounted } from "vue";
import { useSlideContext } from "@slidev/client";
import { parseRangeString } from "@slidev/parser/core";

const { $clicksContext } = useSlideContext() as {
  $clicksContext: ClicksContext;
};

const props = defineProps<{ on: string }>();

const ranges = ref(parseRangeString($clicksContext.total, props.on));

onMounted(() => {
  ranges.value = parseRangeString($clicksContext.total, props.on);
});

const show = () => ranges.value.indexOf($clicksContext.current) !== -1;
</script>

<template>
  <div class="slidev-vclick-target">
    <div v-if="show()">
      <slot />
    </div>
  </div>
</template>
