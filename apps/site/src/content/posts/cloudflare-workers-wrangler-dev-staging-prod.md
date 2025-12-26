---
title: "Cloudflare workers with Wrangler for dev, staging, and prod"
description: >-
  Deploying Cloudflare workers to dev, staging, and prod with Wrangler and
  automatically promoting with GitHub actions.
pubDate: "2024-02-04"
tags:
  - code
  - Cloudflare
  - ops
  - wrangler
  - Cloudflare workers
  - staging
  - edge
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

Cloudflare workers are configured using a tool called [wrangler](https://developers.cloudflare.com/workers/cli-wrangler) combined with a `wrangler.toml` file. This file contains the configuration for the worker, including the name, routes, vars, and much more.

A recent challenge I had was to deploy a worker to a `dev` environment and then promote it to `staging` and `prod` and the combine this with GitHub actions for continuous deployment.

<Note>

This post assumes you have a basic understanding of Cloudflare workers and wrangler. Some configuration options may be omitted for brevity.

</Note>

## Basic Wrangler configuration in TOML

The base `wrangler.toml` file looks like this:

```toml
name = "my-worker"
route = "example.com/*"

[var]
  foo = "bar"
```

This will deploy a worker, when using [Wrangler deploy], named `my-worker` to a route of `example.com/*` and set a variable `foo` to `bar` that can be accessed in the worker code.

<Note>

This does not automatically create the domain in Cloudflare. You will need to do that manually or use the Cloudflare API to create the domain.

</Note>

## Adding environments for dev, staging, and prod

This configuration file can be extended to include a `dev` environment:

<Snippet src="./snippets/cloudflare-workers-wrangler-dev-staging-prod/example.txt" />

This will deploy a worker named `my-worker-dev` to a route of `dev.example.com/*` and set a variable `foo` to `bar` that can be accessed in the worker code.

<Image src="cloudflare-workers-routes.png" alt="Cloudflare worker route for dev worker" />

See the [Wrangler deploy] documentation for more information on deploying to different environments and the documentation on [Cloudflare workers environments](https://developers.cloudflare.com/workers/wrangler/environments/).

I removed the default `route`, `name`, and `var` from the base configuration and added a new section for `dev`. This forces me to call `wrangler deploy --env dev` to deploy to the `dev` environment and will throw an error if I try to deploy to the default environment because there isn't one.

To promote the worker to `staging` and `prod`, I can add additional sections to the `wrangler.toml` file:

<Snippet src="./snippets/cloudflare-workers-wrangler-dev-staging-prod/example-1.txt" />

This enables me to call `wrangler deploy --env staging` and `wrangler deploy --env prod` to deploy to the `staging` and `prod` environments respectively and the works look like this in the dashboard:

<Image src="cloudflare-workers-prod-dev-staging.png" alt="Cloudflare workers for dev, staging, and prod" />

Some fields are not inheritable across environments such as `vars` and `kv-namespaces`. You will need to set these for each environment.

## GitHub actions

To automate the deployment of the worker to the `dev`, `staging`, and `prod` environments, I can use GitHub actions. Here is an example of a GitHub action that deploys the worker to the correct environment based upon the context of the action, such as a push to the `main` branch or a manual trigger.

<Snippet src="./snippets/cloudflare-workers-wrangler-dev-staging-prod/deploy.yaml" />

Alternatively, you could promote to prod when a tag is pushed:

<Snippet src="./snippets/cloudflare-workers-wrangler-dev-staging-prod/deploy-1.yaml" />

And then add a step to deploy to prod:

```yaml
- name: Automatic deploy to prod from tag
  if: ${{ github.ref == 'refs/tags/*' }}
  run: wrangler deploy  --env=prod
```

All of this omits the hard part of knowing when to promote from `staging` to `prod`. The above demonstrates patterns for using tags, testing, or a manual dispatch to promote to `prod`.

## Other considerations

Here are some other considerations when deploying workers to different environments.

### Git commit, tag, etc. in worker code

In any of these cases, you may want to consider injecting a variable into the worker code to indicate the current Git commit, tag, etc.

```yaml
- name: Automatic deploy to prod from tag
  if: ${{ github.ref == 'refs/tags/*' }}
  run: wrangler deploy  --env=prod --var GIT_COMMIT=${{ github.sha }}
```

### Encrypted vars, integrations, etc

These must individually be set for each environment via the dashboard. 😞

[Wrangler deploy]: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
