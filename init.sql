CREATE TABLE IF NOT EXISTS temperature_readings (
    id SERIAL PRIMARY KEY,
    temperature DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
