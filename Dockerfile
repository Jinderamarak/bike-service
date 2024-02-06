FROM rust:1.75.0 as builder
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

FROM rust:1.75.0 as runtime

WORKDIR /app
COPY --from=builder /build/target/release/bike-service .
COPY --from=builder /build/migrations ./migrations

RUN mkdir /data
ENV DATABASE_URL="sqlite:/data/data.db?mode=rwc"

CMD ["./bike-service"]