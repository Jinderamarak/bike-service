-- Create table for users
CREATE TABLE users
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    NOT NULL,
    monthly_goal DOUBLE  NULL,
    created_at   TEXT    NOT NULL,
    deleted_at   TEXT    NULL
);

-- Create table for sessions
CREATE TABLE sessions
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users (id),
    token        TEXT    NOT NULL,
    created_at   TEXT    NOT NULL,
    last_used_at TEXT    NOT NULL,
);

-- Create a default user if there are any bikes
INSERT INTO users (username, created_at)
SELECT 'Default User', current_timestamp
WHERE EXISTS (SELECT 1 FROM bikes);

-- Add a nullable owner_id to bikes
ALTER TABLE bikes
    ADD COLUMN owner_id INTEGER NULL;

-- Fill the owner_id with the default user
UPDATE bikes
SET owner_id = (SELECT id FROM users WHERE username = 'Default User')
WHERE owner_id IS NULL;

-- Change owner_id to not nullable
CREATE TEMPORARY TABLE rides_backup AS SELECT * FROM rides;
DROP TABLE rides;

CREATE TEMPORARY TABLE bikes_backup AS SELECT * FROM bikes;
DROP TABLE bikes;

CREATE TABLE bikes
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT NULL,
    deleted_at  TEXT NULL,
    color       TEXT NULL,
    owner_id    INTEGER NOT NULL REFERENCES users (id)
);

INSERT INTO bikes (id, name, description, deleted_at, owner_id) SELECT id, name, description, deleted_at, owner_id FROM bikes_backup;
DROP TABLE bikes_backup;

CREATE TABLE rides
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    distance    DOUBLE  NOT NULL,
    description TEXT    NULL,
    deleted_at  TEXT    NULL,
    bike_id     INTEGER NOT NULL REFERENCES bikes (id)
);

INSERT INTO rides (id, date, distance, description, deleted_at, bike_id) SELECT id, date, distance, description, deleted_at, bike_id FROM rides_backup;
DROP TABLE rides_backup;