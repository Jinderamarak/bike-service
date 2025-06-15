#   Server Building Part
FROM rust:latest AS builder-backend
WORKDIR /build

COPY ./backend/ ./
RUN cargo build --locked --release

#   Frontend Building Part
FROM node:latest AS builder-frontend
WORKDIR /build

COPY ./frontend/package.json ./package.json
COPY ./frontend/package-lock.json ./package-lock.json
RUN npm ci

COPY ./frontend/ ./
RUN npm run build

#   Runtime Part
FROM rust:slim AS runtime
WORKDIR /app

COPY --from=builder-backend /build/target/release/bike-service .
COPY --from=builder-backend /build/migrations ./migrations
COPY --from=builder-frontend /build/dist ./static

RUN mkdir /data
ENV DATABASE_URL="sqlite:/data/data.db?mode=rwc"
ENV BIKE_STATIC_DIR="./static"

CMD ["./bike-service"]
