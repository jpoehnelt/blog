<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	interface Props {
		icon: SimpleIcon;
		size?: number;
		color?: string;
		class?: string;
		[key: string]: any;
	}

	let { icon, size = 24, color = 'currentColor', class: className, ...rest }: Props = $props();
</script>

<svg
	role="img"
	fill={color ?? `#${icon.hex}`}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	class={className}
	{...rest}
>
	<title>{icon.title}</title>
	<path d={icon.path} />
</svg>
