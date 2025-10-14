<template>
  <div class="slidev-layout two-cols-header">
    <div class="header">
      <slot />
    </div>
    <div class="cols">
      <div class="col-left">
        <slot name="left" />
      </div>
      <div class="col-right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cols {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: auto 1fr;
  gap: 2em;
  width: 100%;
}
</style>
