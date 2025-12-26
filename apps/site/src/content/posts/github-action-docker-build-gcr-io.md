---
title: "Using Google Container Registry, Docker Buildx, and GitHub Actions"
description: A pattern for authenticating to gcr.io from docker/build-push-action.
pubDate: "2022-09-22"
tags:
  - code
  - GitHub
  - docker
  - gcr
  - workflows
  - google cloud
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

Today, I was trying to integrate the [docker/build-push-action](https://github.com/docker/build-push-action) with Google Container Registry (GCR). I was able to get the build working, but I was unable to push the image to GCR due to authentication issues. The solution involved the following.

1. Using the [google-github-actions/auth](https://github.com/google-github-actions/auth) action to authenticate with Google Cloud.
2. Calling `gcloud auth configure-docker --quiet gcr.io` to configure the Docker CLI to use the Google Cloud credentials.

The workflow looks like this.

<Snippet src="./snippets/github-action-docker-build-gcr-io/setup-auth.yaml" />

<Note>

I was unable to get the cache working with GCR. I'm not sure if it's a bug or if I'm doing something wrong.

</Note>

### IAM Role

I also created a custom role based upon `Storage Legacy Bucket Writer` to add to the `github-deployer@` service account.

<Image src="container-pusher-role.png" alt="Custom role for pushing images to gcr.io" />

This includes the following permissions.

- `storage.buckets.get`
- `storage.multipartUploads.abort`
- `storage.multipartUploads.create`
- `storage.multipartUploads.list`
- `storage.multipartUploads.listParts`
- `storage.objects.create`
- `storage.objects.delete`
- `storage.objects.list`

And it works! 🎉
