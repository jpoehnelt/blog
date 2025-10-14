<template>
  <div
    ref="parentRef"
    class="scale-to-fit-parent"
    :style="{ '--gradient-color': gradientColor }"
  >
    <div
      ref="contentRef"
      class="scale-to-fit-content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from "vue";

const props = withDefaults(
  defineProps<{
    minScale?: number;
    maxScale?: number;
    gradientColor?: string;
  }>(),
  {
    minScale: 0.1,
    maxScale: 1,
    gradientColor: "white",
  },
);

const parentRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const contentClass = ref("");

const contentStyle = reactive({
  transform: "scale(1)",
  transformOrigin: "top left",
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (parentRef.value && contentRef.value) {
    const updateScale = () => {
      const parentWidth = parentRef.value?.clientWidth;
      const parentHeight = parentRef.value?.clientHeight;
      const contentWidth = contentRef.value?.scrollWidth;
      const contentHeight = contentRef.value?.scrollHeight;

      if (
        parentWidth &&
        parentHeight &&
        contentWidth &&
        contentHeight &&
        contentWidth > 0 &&
        contentHeight > 0
      ) {
        const scaleX = parentWidth / contentWidth;
        const scaleY = parentHeight / contentHeight;
        let scale = Math.min(scaleX, scaleY);
        scale = Math.max(props.minScale, Math.min(props.maxScale, scale));

        contentStyle.transform = `scale(${scale})`;

        if (scale < 0.6) {
          contentClass.value = "tighter";
        } else if (scale < 0.8) {
          contentClass.value = "tight";
        } else {
          contentClass.value = "";
        }
      }
    };

    resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(parentRef.value);

    // Initial scale update
    updateScale();
  }
});

onUnmounted(() => {
  if (resizeObserver && parentRef.value) {
    resizeObserver.unobserve(parentRef.value);
  }
});
</script>

<style scoped>
.scale-to-fit-parent {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.scale-to-fit-parent::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(
    to top,
    var(--gradient-color, white),
    transparent
  );
}

.scale-to-fit-content {
  position: absolute;
  top: 0;
  left: 0;
}

.scale-to-fit-content.tight :deep(p),
.scale-to-fit-content.tight :deep(pre) {
  line-height: 0.9rem !important;
  margin: 0.5rem auto;
}

.scale-to-fit-content.tighter :deep(p),
.scale-to-fit-content.tighter :deep(pre) {
  line-height: 0.7rem !important;
  margin: 0.25rem auto;
}
</style>
