# Database Schema - Apache Cassandra

**Keyspace:** `smart_city`  
**Strategy:** `SimpleStrategy`  
**Replication Factor:** `1` (development)

> ⚠️ **Production Recommendation:** Gunakan `NetworkTopologyStrategy` dengan replication factor minimal 3.

---

## 📊 Entity Relationship

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│     sensors     │────▶│   energy_logs    │     │ district_profiles  │
│  (Metadata)     │     │  (Time-Series)   │     │    (Context)       │
└─────────────────┘     └──────────────────┘     └────────────────────┘
        │                       │                        │
   sensor_id              sensor_id +              district_name
   (PRIMARY KEY)           event_date                (PRIMARY KEY)
                         (PARTITION KEY)
```

---

## 📋 Tables

### 1. sensors (Metadata Table)

Menyimpan informasi metadata sensor untuk operasi CRUD.

```sql
CREATE TABLE IF NOT EXISTS sensors (
    sensor_id uuid PRIMARY KEY,
    district_name text,
    latitude decimal,
    longitude decimal,
    energy_source text,     -- 'Solar' atau 'Grid'
    status text,            -- 'Active', 'Maintenance', 'Offline'
    created_at timestamp
);

-- Secondary Indexes untuk query filtering
CREATE INDEX IF NOT EXISTS sensors_by_district ON sensors (district_name);
CREATE INDEX IF NOT EXISTS sensors_by_status ON sensors (status);
```

**Karakteristik:**
- **Primary Key:** `sensor_id` (UUID)
- **Access Pattern:** 
  - Lookup by ID
  - List all sensors
  - Filter by district atau status

**Contoh Data:**
| sensor_id | district_name | latitude | longitude | energy_source | status |
|-----------|---------------|----------|-----------|---------------|--------|
| uuid-1 | Jakarta Pusat | -6.1751 | 106.8650 | Solar | Active |
| uuid-2 | Jakarta Selatan | -6.2615 | 106.8106 | Grid | Active |

---

### 2. energy_logs (Time-Series Table)

Menyimpan data energi high-frequency dari sensor.

```sql
CREATE TABLE IF NOT EXISTS energy_logs (
    sensor_id uuid,
    event_date date,           -- Partition key (tanggal)
    recorded_at timestamp,     -- Clustering key (waktu)
    kwh_usage decimal,
    voltage int,
    PRIMARY KEY ((sensor_id, event_date), recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC);
```

**Karakteristik:**
- **Partition Key:** `(sensor_id, event_date)` - Composite partition untuk distribusi data per sensor per hari
- **Clustering Key:** `recorded_at DESC` - Data terbaru di atas untuk query LIMIT 1
- **Access Pattern:**
  - Latest reading: `WHERE sensor_id = ? AND event_date = ? LIMIT 1`
  - Historical range: `WHERE sensor_id = ? AND event_date = ? AND recorded_at >= ? AND recorded_at <= ?`
  - Daily aggregation: `WHERE sensor_id = ? AND event_date = ?`

**Contoh Data:**
| sensor_id | event_date | recorded_at | kwh_usage | voltage |
|-----------|------------|-------------|-----------|---------|
| uuid-1 | 2026-01-07 | 12:30:00 | 5.25 | 220 |
| uuid-1 | 2026-01-07 | 12:25:00 | 5.18 | 219 |
| uuid-1 | 2026-01-07 | 12:20:00 | 5.30 | 221 |

**Estimasi Ukuran Partisi:**
- 1 sensor × 12 readings/minute × 60 minutes × 24 hours = ~17,280 rows/day/sensor
- ~100 bytes/row → ~1.7 MB/day/sensor
- Aman untuk Cassandra (ideal < 100MB per partition)

---

### 3. district_profiles (Context Table)

Menyimpan informasi profil distrik untuk konteks dan analytics.

```sql
CREATE TABLE IF NOT EXISTS district_profiles (
    district_name text PRIMARY KEY,
    population int,
    category text              -- 'Industrial', 'Residential', 'Commercial'
);
```

**Karakteristik:**
- **Primary Key:** `district_name` (text)
- **Access Pattern:** Lookup by district name, list all districts

**Contoh Data:**
| district_name | population | category |
|---------------|------------|----------|
| Jakarta Pusat | 1,200,000 | Commercial |
| Jakarta Selatan | 2,200,000 | Residential |
| Jakarta Utara | 1,800,000 | Industrial |
| Jakarta Barat | 2,400,000 | Residential |
| Jakarta Timur | 2,900,000 | Residential |

---

## 🔧 Initialization Script

File: `database/init.cql`

```sql
-- Create Keyspace
CREATE KEYSPACE IF NOT EXISTS smart_city 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE smart_city;

-- Create Tables
-- (lihat definisi tabel di atas)

-- Insert Sample District Profiles
INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Pusat', 1200000, 'Commercial');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Selatan', 2200000, 'Residential');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Utara', 1800000, 'Industrial');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Barat', 2400000, 'Residential');

INSERT INTO district_profiles (district_name, population, category) 
VALUES ('Jakarta Timur', 2900000, 'Residential');
```

---

## 📈 Query Patterns

### 1. Get Latest Sensor Reading
```sql
SELECT * FROM energy_logs 
WHERE sensor_id = ? AND event_date = ? 
LIMIT 1;
-- Menggunakan clustering order DESC, otomatis dapat yang terbaru
```

### 2. Get Hourly Data for Charts
```sql
SELECT * FROM energy_logs 
WHERE sensor_id = ? AND event_date = ? 
AND recorded_at >= ? AND recorded_at <= ?;
-- Range query untuk agregasi per jam
```

### 3. Calculate Daily Total
```sql
SELECT * FROM energy_logs 
WHERE sensor_id = ? AND event_date = ?;
-- Fetch all, aggregate in application layer
```

### 4. Get All Active Sensors
```sql
SELECT * FROM sensors WHERE status = 'Active';
-- Menggunakan secondary index
```

### 5. Get Sensors by District
```sql
SELECT * FROM sensors WHERE district_name = 'Jakarta Pusat';
-- Menggunakan secondary index
```

---

## ⚠️ Design Decisions

1. **Composite Partition Key untuk energy_logs:**
   - `(sensor_id, event_date)` memastikan data terdistribusi merata
   - Mencegah "hot partition" dengan memisahkan per hari
   - Query history hanya untuk satu hari dalam satu query

2. **No ORM (Pure CQL):**
   - Menggunakan `CqlSession` dan `PreparedStatement`
   - Full control atas query optimization
   - Sesuai dengan requirement proyek

3. **Secondary Indexes:**
   - Digunakan hanya untuk low-cardinality columns (`status`, `district_name`)
   - Untuk high-cardinality, gunakan denormalization atau materialized views

4. **Decimal vs Double:**
   - `kwh_usage` menggunakan `decimal` untuk presisi finansial
   - `latitude/longitude` menggunakan `decimal` untuk koordinat presisi tinggi
