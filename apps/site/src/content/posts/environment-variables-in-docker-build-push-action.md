---
title: Environment Variables in GitHub Docker build-push-action
description: >-
  A basic pattern for passing environment variables to the
  docker/build-push-action from a GitHub secret.
pubDate: "2022-09-22"
tags:
  - code
  - GitHub
  - docker
  - environment variables
  - workflows
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

I recently ran into an issue where I was required to pass environment variables into a Docker container. I was using the [docker/build-push-action](https://github.com/docker/build-push-action) to build and push the container and everything was working fine until I needed the `SENTRY_AUTH_TOKEN` environment variable as part of the build step for my NextJS application.

The solution has two parts.

1. Pass the secret as a build argument in the [docker/build-push-action](https://github.com/docker/build-push-action) step.
1. Modify the multi-stage Dockerfile to use the build argument as an environment variable.

### GitHub secret to build-args

This part was easy.

<Snippet src="./snippets/environment-variables-in-docker-build-push-action/build-and-push.yaml" />

### Dockerfile

The Dockerfile change is also straightforward.

```dockerfile
# The SENTRY_AUTH_TOKEN is used to upload the source maps to Sentry
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
```

The `ARG` and `ENV` lines must be in the same stage of the Dockerfile that requires it. If you have multiple stages, you'll need to add the `ARG` and `ENV` lines to each stage.

❗ The `ARG` value will be accessible to anyone that has access to the Docker image. If you are using a private registry, this is not a problem. If you are using a public registry, you should be careful about what you pass as an `ARG`.

And it works! 🎉
