---
title: Optimized Dockerfile for Rust
description: >-
  A simple Dockerfile for a Rust project that caches dependencies and uses a
  minimal Debian image.
pubDate: "2024-01-05"
tags:
  - code
  - rust
  - docker
  - ops
  - performance
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

Below is a simple Dockerfile for a Rust project. It uses a multi-stage build to first build the project and then copy the binary into a new image. This is a common pattern for compiled languages.

The first stage is named `builder`. It caches the dependencies with a dummy `src/main.rs` file. This allows the dependencies to be cached and reused when the source code changes.

```docker
# Build dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir ./src && echo 'fn main() {}' > ./src/main.rs
RUN cargo build --release
```

The `main.rs` file is then deleted and the real source code is copied in. This forces the build to recompile the source code, but not the dependencies.

<Snippet src="./snippets/rust-optimized-docker-file/example.dockerfile" />

The `run` stage uses the `debian:bookworm-slim` image which is a minimal Debian image. The `bookworm` tag is the codename for the next Debian release. The `-slim` tag is a minimal version of the image.

<Snippet src="./snippets/rust-optimized-docker-file/example-1.dockerfile" />

The full Dockerfile is below.

<Snippet src="./snippets/rust-optimized-docker-file/example-2.dockerfile" />
