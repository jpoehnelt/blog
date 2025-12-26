---
title: Rust Compiler Whack-a-Mole
description: >-
  Playing whack-a-mole with the rust compiler is both frustrating and a great
  learning experience.
pubDate: "2023-07-10"
tags:
  - code
  - rust
  - debugging
  - tokio
  - async
  - channels
  - plex
  - plexamp
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

Playing whack-a-mole with the Rust compiler is both frustrating and a great learning experience. The below code is a prototype version of a project I'm working on. It's for a terminal ui to control PlexAmp players. I am using this project to learn Rust and get into a proper systems level language. I would probably be done already if it was in NodeJS or similar!

<Snippet src="./snippets/rust-whack-a-mole/event-tx-tui.rs" />

Basically, the `main` function sets up the channels and spawns the tasks. The `tokio::select!` macro waits for one of the tasks to complete and then exits the program. This took me a little while to get it to compile and I'll probably need to rewrite it again when I actually get into setting up the CrossTerm backend.

### Things I learned

- `tokio::select!` is a macro that takes a list of futures and waits for **one** of them to complete. It returns the result of the completed future.
- I need to properly `clone` or `resubscribe` the channels for each task that needs to send or receive on the channel. This is because the channel is moved into the task and can't be used again in the `tokio::select!` macro.
- I can mark an argument as `mut` in the `tokio::select!` macro to allow it to be mutated in the task.

### Things I need to explore further

- Can I use a `tokio::sync::watch` channel instead? I only ever need the latest version of the model but the tradeoff as far as I can tell is that `watch_rx.borrow()` will lock the channel until the borrow is dropped. This means that I can't have multiple tasks borrowing the channel at the same time.
- CrossTerm usage with tokio. The above code is using the `tokio::signal::ctrl_c()` future to listen for terminal events and then forward them on the event channel. I doubt this will work with CrossTerm and I'll need to find another way to listen for an exit event. I have some ideas but I'll need to do some more research.
