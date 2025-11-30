<script lang="ts">
  let {
    type,
    id,
    fullWidth = false,
    style = "standard",
    terrain = "2d",
    fromEmbed = true
  }: {
    type: "activity" | "route";
    id: string;
    fullWidth?: boolean;
    style?: string;
    terrain?: string;
    fromEmbed?: boolean;
  } = $props();

  const dataFullWidth = fullWidth ? "true" : undefined;
  const dataFromEmbed = fromEmbed ? "true" : "false";
</script>

<svelte:head>
  <script src="https://strava-embeds.com/embed.js"></script>
</svelte:head>

<div class="strava-embed-placeholder"
     data-embed-type={type}
     data-embed-id={id}
     data-full-width={dataFullWidth}
     data-style={style}
     data-terrain={terrain}
     data-from-embed={dataFromEmbed}
></div>
