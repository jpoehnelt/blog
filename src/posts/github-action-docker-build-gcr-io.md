---
layout: post
title: Using Google Container Registry, Docker Buildx, and GitHub Actions
excerpt: "A pattern for authenticating to gcr.io from docker/build-push-action."
tags:
  - post
  - code
  - GitHub
  - docker
  - gcr
  - workflows
  - google cloud
date: "2022-09-22T00:00:00.000Z"
hideToc: true
---

Today, I was trying to integrate the [docker/build-push-action](https://github.com/docker/build-push-action) with Google Container Registry (GCR). I was able to get the build working, but I was unable to push the image to GCR due to authentication issues. The solution involved the following.

1. Using the [google-github-actions/auth](https://github.com/google-github-actions/auth) action to authenticate with Google Cloud.
2. Calling `gcloud auth configure-docker --quiet gcr.io` to configure the Docker CLI to use the Google Cloud credentials.

The workflow looks like this.

{% raw %}

```yml
- name: Setup auth
  id: "auth"
  uses: "google-github-actions/auth@v0"
  with:
    workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
    service_account: "github-deployer@${{ secrets.GOOGLE_CLOUD_PROJECT }}.iam.gserviceaccount.com"
- name: Setup docker
  uses: docker/setup-buildx-action@v2
- name: Authenticate docker
  run: |
    gcloud auth configure-docker --quiet gcr.io
- name: Build and push
  uses: docker/build-push-action@v3
  with:
    context: .
    push: true
    tags: ${{ env.IMAGE }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

{% endraw %}

:::note
I was unable to get the cache working with GCR. I'm not sure if it's a bug or if I'm doing something wrong.
:::

### IAM Role

I also created a custom role based upon `Storage Legacy Bucket Writer` to add to the `github-deployer@` service account.

{% image src="src/images/container-pusher-role.png", alt="Custom role for pushing images to gcr.io" %}

This includes the following permissions.

- `storage.buckets.get`
- `storage.multipartUploads.abort`
- `storage.multipartUploads.create`
- `storage.multipartUploads.list`
- `storage.multipartUploads.listParts`
- `storage.objects.create`
- `storage.objects.delete`
- `storage.objects.list`

And it works! :tada:
