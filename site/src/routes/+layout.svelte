<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import { getDefaultSocialLinks } from "$lib/social-icons";

	import "../app.css";

	let { children } = $props();

	// Configure your social links here
	const socialLinks = getDefaultSocialLinks({
		github: "https://github.com/jpoehnelt",
		linkedin: "https://www.linkedin.com/in/justin-poehnelt",
		// twitter: "https://twitter.com/yourhandle",
		// bluesky: "https://bsky.app/profile/yourhandle",
		// email: "your@email.com",
		// rss: true,
	});
</script>

<Navbar {socialLinks} />

{@render children()}
