---
layout: post
title: Unwatch All Repositories in a GitHub Organization
excerpt: "Using the GitHub CLI to unsubscribe from repositories."
tags:
    - post
    - code
    - GitHub
    - gh
    - automation
date: '2022-06-03T00:00:00.000Z'
---

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

```txt
"googlemaps/.github"
"googlemaps/android-maps-rx"
"googlemaps/android-places-ktx"
"googlemaps/google-maps-services-go"
"googlemaps/google-maps-services-python"
"googlemaps/googlemaps.github.io"
"googlemaps/js-api-loader"
"googlemaps/js-jest-mocks"
"googlemaps/js-markerclustererplus"
"googlemaps/js-markermanager"
"googlemaps/js-markerwithlabel"
"googlemaps/js-ogc"
"googlemaps/js-polyline-codec"
"googlemaps/js-samples"
"googlemaps/js-three"
"googlemaps/js-types"
"googlemaps/openapi-specification"
"googlemaps/react-wrapper"
"googlemaps/v3-utility-library"
```

Now all I had to do was pipe this into another `gh api` command to delete the subscription.

```bash
gh api --paginate "https://api.github.com/user/subscriptions" |
  | jq '.[] | .full_name' \
  | grep googlemaps \
  | xargs -I {} \
    gh api \
      -X DELETE \
      "https://api.github.com/repos/{}/subscription"
```

Now when I go to one of the repositories, I see that I am only subscribed to "Participating and @mentions" instead of "All Activity".

{% image src="src/images/github-notifications.png", alt="GitHub watch notifications menu" %}

:::note
**Note**: The REST api docs are at https://docs.github.com/en/rest/activity/watching#delete-a-repository-subscription.
:::
