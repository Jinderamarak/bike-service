FROM rust:latest as builder
WORKDIR /build
COPY ./migrations ./migrations
COPY ./src ./src
COPY ./templates ./templates
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN cargo install sqlx-cli --no-default-features --features sqlite

ENV DATABASE_URL=sqlite:./data.db
RUN sqlx database create
RUN sqlx migrate run

RUN cargo build --release

FROM rust:latest as runtime
WORKDIR /app
COPY --from=builder /build/target/release/bike-service .
COPY --from=builder /build/migrations ./migrations

COPY --from=builder /build/data.db /data/data.db

CMD ["./bike-service", "-d", "/data/data.db"]