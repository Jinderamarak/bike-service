FROM rust:latest as builder
WORKDIR /build

COPY ./migrations ./migrations
COPY ./.sqlx ./.sqlx

COPY ./src ./src
COPY ./templates ./templates

COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN cargo build --release

FROM rust:latest as runtime

WORKDIR /app
COPY --from=builder /build/target/release/bike-service .
COPY --from=builder /build/migrations ./migrations

RUN mkdir /data
ENV DATABASE_URL="sqlite:/data/data.db?mode=rwc"

CMD ["./bike-service"]