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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 2em;
  align-items: center;
  justify-items: center;
}

.col-left,
.col-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
