-- Add migration script here
CREATE TABLE mileage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    distance DOUBLE NOT NULL
);