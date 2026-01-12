-- Smart City Energy Monitoring - Database Initialization Script
-- Run this script in cqlsh: SOURCE 'init.cql'

-- 1. Create Keyspace
CREATE KEYSPACE IF NOT EXISTS smart_city 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE smart_city;

-- 2. Sensors Table (Metadata - CRUD Operations)
CREATE TABLE IF NOT EXISTS sensors (
    sensor_id uuid PRIMARY KEY,
    district_name text,
    latitude decimal,
    longitude decimal,
    energy_source text,     -- 'Solar' or 'Grid'
    status text,            -- 'Active', 'Maintenance', 'Offline'
    created_at timestamp
);

-- 3. Energy Logs Table (Time-Series - High-frequency writes)
-- Partitioned by sensor and date for optimal performance
CREATE TABLE IF NOT EXISTS energy_logs (
    sensor_id uuid,
    event_date date,           -- Partition Key (YYYY-MM-DD)
    recorded_at timestamp,     -- Clustering Key
    kwh_usage decimal,
    voltage int,
    PRIMARY KEY ((sensor_id, event_date), recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC);

-- 4. District Profiles Table (Context Data - Reports & Analytics)
CREATE TABLE IF NOT EXISTS district_profiles (
    district_name text PRIMARY KEY,
    population int,
    category text              -- 'Industrial', 'Residential', 'Commercial'
);

-- 5. Counter Table for Total Wh per days per energy source
CREATE TABLE IF NOT EXISTS energy_daily_summary (
  date text,
  energy_source text,
  total_wh counter,
  PRIMARY KEY (date, energy_source)
);

-- 6. Create Indexes for Common Queries
CREATE INDEX IF NOT EXISTS sensors_by_district ON sensors (district_name);
CREATE INDEX IF NOT EXISTS sensors_by_status ON sensors (status);

-- 7. Insert Sample District Profiles
INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Pusat', 1200000, 'Commercial');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Selatan', 2200000, 'Residential');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Utara', 1800000, 'Industrial');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Barat', 2500000, 'Residential');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Timur', 2900000, 'Industrial');

-- 8. Insert Sample Sensors
INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Pusat', -6.1751, 106.8650, 'Solar', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Pusat', -6.1850, 106.8550, 'Grid', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Selatan', -6.2615, 106.8106, 'Solar', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Selatan', -6.2800, 106.8200, 'Grid', 'Maintenance', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Utara', -6.1214, 106.9004, 'Grid', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Barat', -6.1681, 106.7588, 'Solar', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Timur', -6.2250, 106.9004, 'Grid', 'Active', toTimestamp(now()));

INSERT INTO sensors (sensor_id, district_name, latitude, longitude, energy_source, status, created_at)
VALUES (uuid(), 'Jakarta Timur', -6.2400, 106.9200, 'Solar', 'Offline', toTimestamp(now()));
