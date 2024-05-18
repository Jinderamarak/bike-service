-- Create bikes table
CREATE TABLE bikes
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT NULL,
    deleted_at  TEXT NULL
);

-- Add nullable bike_id column to rides table
ALTER TABLE rides
    ADD COLUMN bike_id INTEGER NULL REFERENCES bikes (id);

-- Add a default bike if there are any rides
INSERT INTO bikes (name) 
SELECT 'Default Bike' 
WHERE NOT EXISTS (SELECT 1 FROM bikes WHERE name = 'Default Bike') 
AND EXISTS (SELECT 1 FROM rides);

-- Update rides to use the default bike
UPDATE rides 
SET bike_id = (SELECT id FROM bikes WHERE name = 'Default Bike')
WHERE bike_id IS NULL;

-- Change bike_id to NOT NULL
CREATE TEMPORARY TABLE rides_backup AS SELECT * FROM rides;
DROP TABLE rides;
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
