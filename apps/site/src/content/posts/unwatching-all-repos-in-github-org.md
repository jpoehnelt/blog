---
title: Unwatch All Repositories in a GitHub Organization
description: Using the GitHub CLI to unsubscribe from repositories.
pubDate: "2022-06-03"
tags:
  - code
  - GitHub
  - gh
  - automation
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

I am currently changing teams at Google and need to unsubscribe from all repositories in my former GitHub organization. This is possible to do at github.com/watching, but as always, I want to avoid a bunch of clicks. This will require a few steps:

1. Find existing subscriptions using the Github API.
2. Filter out subscriptions that are not in the organization.
3. Unsubscribe from each repository.

I'm planning to use the [GitHub cli](https://cli.github.com/) to make this a little smoother.

```bash
gh api --paginate "https://api.github.com/user/subscriptions" |
  | jq '.[] | .full_name' \
  | grep googlemaps \
  | sort
```

I was subscribed to the following repositories in the GitHub organization.

<Snippet src="./snippets/unwatching-all-repos-in-github-org/example.txt" />

Now all I had to do was pipe this into another `gh api` command to delete the subscription.

<Snippet src="./snippets/unwatching-all-repos-in-github-org/example.sh" />

Now when I go to one of the repositories, I see that I am only subscribed to "Participating and @mentions" instead of "All Activity".

<Image src="github-notifications.png" alt="GitHub watch notifications menu" />

<Note>

**Note**: The REST api docs are at https://docs.github.com/en/rest/activity/watching#delete-a-repository-subscription.

</Note>
