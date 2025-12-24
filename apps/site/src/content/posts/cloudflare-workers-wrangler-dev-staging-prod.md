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
  import img_cloudflare_workers_routes_png from "$lib/images/cloudflare-workers-routes.png?enhanced";
  import img_cloudflare_workers_prod_dev_staging_png from "$lib/images/cloudflare-workers-prod-dev-staging.png?enhanced";
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

```toml
[env.dev]
name = "my-worker-dev"
route = "dev.example.com/*"

[env.dev.var]
  foo = "bar"
```

This will deploy a worker named `my-worker-dev` to a route of `dev.example.com/*` and set a variable `foo` to `bar` that can be accessed in the worker code.

<Image src={img_cloudflare_workers_routes_png} alt="Cloudflare worker route for dev worker" />

See the [Wrangler deploy] documentation for more information on deploying to different environments and the documentation on [Cloudflare workers environments](https://developers.cloudflare.com/workers/wrangler/environments/).

I removed the default `route`, `name`, and `var` from the base configuration and added a new section for `dev`. This forces me to call `wrangler deploy --env dev` to deploy to the `dev` environment and will throw an error if I try to deploy to the default environment because there isn't one.

To promote the worker to `staging` and `prod`, I can add additional sections to the `wrangler.toml` file:

```toml
[env.staging]
name = "my-worker-staging"
route = "staging.example.com/*"

[env.staging.var]
  foo = "bar"

[env.prod]
name = "my-worker-prod"
route = "example.com/*"

[env.prod.var]
  foo = "bar"
```

This enables me to call `wrangler deploy --env staging` and `wrangler deploy --env prod` to deploy to the `staging` and `prod` environments respectively and the works look like this in the dashboard:

<Image src={img_cloudflare_workers_prod_dev_staging_png} alt="Cloudflare workers for dev, staging, and prod" />

Some fields are not inheritable across environments such as `vars` and `kv-namespaces`. You will need to set these for each environment.

## GitHub actions

To automate the deployment of the worker to the `dev`, `staging`, and `prod` environments, I can use GitHub actions. Here is an example of a GitHub action that deploys the worker to the correct environment based upon the context of the action, such as a push to the `main` branch or a manual trigger.

```yaml
name: Deploy
on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment"
        required: true
        type: choice
        options:
          - prod
          - staging
        default: staging
jobs:
  deploy:
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      # other steps to checkout/build/test/etc
      - name: Manual deploy
        if: ${{ github.event_name == 'workflow_dispatch' }}
        run: wrangler deploy --env=${{ github.event.inputs.environment }}
      - name: Automatic deploy to staging
        if: ${{ github.ref == 'refs/heads/main' && github.event_name == 'push' }}
        run: wrangler deploy --env=staging
  promote:
    if: ${{ github.ref == 'refs/heads/main' }}
    runs-on: ubuntu-latest
    needs: deploy
    env:
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      # verify staging deployment through integration tests
      - run: wrangler deploy  --env=staging
```

Alternatively, you could promote to prod when a tag is pushed:

```yaml
name: Deploy
on:
  push:
    branches:
      - main
    tags:
      - "*"
```

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
