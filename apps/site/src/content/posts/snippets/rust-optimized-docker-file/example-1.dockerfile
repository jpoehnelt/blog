# Run stage
FROM debian:bookworm-slim as run

RUN apt-get update && apt install -y openssl && rm -rf /var/lib/apt/lists/* && apt-get clean

COPY --from=builder /usr/src/app/target/release/app /usr/local/bin

ENTRYPOINT ["/usr/local/bin/app"]