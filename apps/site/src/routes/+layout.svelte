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

	// Use constant to avoid hydration mismatch
	const currentYear = 2025;
</script>

<Navbar {socialLinks} />

{@render children()}

<footer class="mt-auto py-8 border-t">
	<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
		<p>Copyright © {currentYear} Justin Poehnelt</p>
	</div>
</footer>
