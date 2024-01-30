CREATE TABLE rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    distance DOUBLE NOT NULL
);

INSERT INTO rides (id, date, distance)
SELECT * FROM mileage;

DROP TABLE mileage;
