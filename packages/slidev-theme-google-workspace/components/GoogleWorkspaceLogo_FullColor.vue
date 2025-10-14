<!-- Google Workspace Logos Component -->
<template>
  <img
    :src="GoogleWorkspaceLogo"
    alt="Google Workspace Logo"
    :class="['absolute top-12 left-12 max-h-4 w-auto', props.class]"
  />
</template>

<script setup lang="ts">
import GoogleWorkspaceLogo from "../assets/GoogleWorkspaceLogo_FullColor_rgb_750x96px.png";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});
</script>
