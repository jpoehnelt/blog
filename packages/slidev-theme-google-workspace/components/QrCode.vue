<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations/useQRCode";
import type { QRCodeToDataURLOptions } from "qrcode";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "QR Code",
  },
});

const options: QRCodeToDataURLOptions = { margin: 0 };
const qrcode = useQRCode(props.text, options);
</script>

<template>
  <div class="flex flex-col max-w-20 items-center justify-center gap-0">
    <img :src="qrcode" :alt="props.label" class="mb-0" />
    <span v-if="props.label" class="text-xs scale-75 text-center min-h-12">{{
      props.label
    }}</span>
  </div>
</template>

<style scoped></style>
