---
layout: post
title: Optimized Dockerfile for Rust
excerpt: A simple Dockerfile for a Rust project that caches dependencies and uses a minimal Debian image.
tags:
    - post
    - code
    - rust
    - docker
    - ops
    - performance
date: '2024-01-05T00:00:00.000Z'
hideToc: true
---

Below is a simple Dockerfile for a Rust project. It uses a multi-stage build to first build the project and then copy the binary into a new image. This is a common pattern for compiled languages.

The first stage is named `builder`. It caches the dependencies with a dummy `src/main.rs` file. This allows the dependencies to be cached and reused when the source code changes. 

```docker
# Build dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir ./src && echo 'fn main() {}' > ./src/main.rs
RUN cargo build --release
```

The `main.rs` file is then deleted and the real source code is copied in. This forces the build to recompile the source code, but not the dependencies. 


```docker
# Replace with real src
RUN rm -rf ./src
COPY ./src ./src

# break the Cargo cache
RUN touch ./src/main.rs

# Build the project
RUN cargo build --release
```

The `run` stage uses the `debian:bookworm-slim` image which is a minimal Debian image. The `bookworm` tag is the codename for the next Debian release. The `-slim` tag is a minimal version of the image.

```docker
# Run stage
FROM debian:bookworm-slim as run

RUN apt-get update && apt install -y openssl && rm -rf /var/lib/apt/lists/* && apt-get clean

COPY --from=builder /usr/src/app/target/release/app /usr/local/bin

ENTRYPOINT ["/usr/local/bin/app"]
```

The full Dockerfile is below.

```docker
# Build stage
FROM rust:bookworm as builder

WORKDIR /usr/src/app

# Build dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir ./src && echo 'fn main() {}' > ./src/main.rs
RUN cargo build --release

# Replace with real src
RUN rm -rf ./src
COPY ./src ./src

# break the Cargo cache
RUN touch ./src/main.rs

# Build the project
RUN cargo build --release

# Run stage
FROM debian:bookworm-slim as run

RUN apt-get update && apt install -y openssl && rm -rf /var/lib/apt/lists/* && apt-get clean

COPY --from=builder /usr/src/app/target/release/app /usr/local/bin

ENTRYPOINT ["/usr/local/bin/app"]
```
