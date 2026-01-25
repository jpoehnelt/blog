<script lang="ts">
  let scrollY = $state(0);
  let innerHeight = $state(0);
  let docHeight = $state(0);

  function updateHeight() {
    docHeight = document.documentElement.scrollHeight;
  }

  $effect(() => {
    updateHeight();
    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  });

  let progress = $derived.by(() => {
    const availableScroll = docHeight - innerHeight;
    if (availableScroll <= 0) return 0;
    const p = (scrollY / availableScroll) * 100;
    return Math.min(100, Math.max(0, p));
  });
</script>

<svelte:window bind:scrollY bind:innerHeight onresize={updateHeight} />

<div
  class="fixed top-0 left-0 w-1 bg-[#FF6700] z-50 transition-all duration-75 ease-out"
  style:height="{progress}%"
  role="progressbar"
  aria-valuenow={Math.round(progress)}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Reading progress"
></div>
