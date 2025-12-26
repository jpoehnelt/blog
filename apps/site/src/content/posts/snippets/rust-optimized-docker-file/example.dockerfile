# Replace with real src
RUN rm -rf ./src
COPY ./src ./src

# break the Cargo cache
RUN touch ./src/main.rs

# Build the project
RUN cargo build --release