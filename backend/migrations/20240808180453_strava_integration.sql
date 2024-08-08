-- Create table for linking to Strava
CREATE TABLE strava
(
    user_id       INTEGER PRIMARY KEY NOT NULL REFERENCES users (id),
    strava_id     INTEGER NOT NULL UNIQUE,
    last_sync     TEXT    NOT NULL,
    access_token  TEXT    NOT NULL,
    refresh_token TEXT    NOT NULL,
    expires_at    TEXT    NOT NULL
);

ALTER TABLE rides
    ADD COLUMN strava_ride INTEGER;

ALTER TABLE bikes
    ADD COLUMN strava_gear TEXT;
