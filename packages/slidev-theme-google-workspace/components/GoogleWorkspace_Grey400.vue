<!-- Google Workspace Logos Component -->
<template>
  <img
    :src="Google_Workspace_256x34px_Grey400"
    alt="Google Workspace Logo"
    :class="['absolute bottom-3 right-8 max-h-3 w-auto', props.class]"
  />
</template>

<script setup lang="ts">
import Google_Workspace_256x34px_Grey400 from "../assets/Google_Workspace_256x34px_Grey400@3x.png";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});
</script>
