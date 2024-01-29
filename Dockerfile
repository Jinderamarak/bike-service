FROM rust:latest as builder
RUN cargo install sqlx-cli --no-default-features --features sqlite

WORKDIR /build
COPY ./src ./src
COPY ./templates ./templates
COPY ./migrations ./migrations
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

ENV DATABASE_URL=sqlite:./data.db
RUN sqlx database create
RUN sqlx migrate run

RUN cargo build --release

FROM rust:latest as runtime

WORKDIR /app
COPY --from=builder /build/target/release/bike-service .
COPY --from=builder /build/migrations ./migrations

CMD ["./bike-service"]