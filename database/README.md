# 🗄️ Database Setup - Apache Cassandra

Script dan dokumentasi untuk setup database Apache Cassandra pada Smart City Energy Monitoring System.

## 📋 Prerequisites

- Docker Desktop (recommended) atau Apache Cassandra installed locally
- Akses terminal/command line

---

## 🚀 Quick Start

### 1. Jalankan Cassandra Container

```bash
docker run --name smart-city-db -p 9042:9042 -d cassandra:latest
```

### 2. Tunggu Cassandra Ready (~30-60 detik)

```bash
# Cek logs sampai muncul "Starting listening for CQL clients"
docker logs smart-city-db | grep "Starting listening"

# Atau cek dengan health check
docker exec -it smart-city-db cqlsh -e "SHOW VERSION"
```

### 3. Initialize Database

```bash
# Copy init script ke container
docker cp init.cql smart-city-db:/init.cql

# Execute initialization
docker exec -it smart-city-db cqlsh -f /init.cql
```

### 4. Verifikasi Setup

```bash
docker exec -it smart-city-db cqlsh -e "USE smart_city; DESCRIBE TABLES;"
```

Output expected:
```
sensors
energy_logs
district_profiles
```

---

## 📁 Files

| File | Deskripsi |
|------|-----------|
| `init.cql` | Script inisialisasi database (keyspace, tables, sample data) |
| `README.md` | Dokumentasi setup (file ini) |

---

## 🗄️ Database Schema

### Keyspace

```sql
CREATE KEYSPACE IF NOT EXISTS smart_city 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
```

### Tables

#### 1. sensors (Metadata)
```sql
CREATE TABLE sensors (
    sensor_id uuid PRIMARY KEY,
    district_name text,
    latitude decimal,
    longitude decimal,
    energy_source text,     -- 'Solar' atau 'Grid'
    status text,            -- 'Active', 'Maintenance', 'Offline'
    created_at timestamp
);
```

#### 2. energy_logs (Time-Series)
```sql
CREATE TABLE energy_logs (
    sensor_id uuid,
    event_date date,
    recorded_at timestamp,
    kwh_usage decimal,
    voltage int,
    PRIMARY KEY ((sensor_id, event_date), recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC);
```

#### 3. district_profiles (Context)
```sql
CREATE TABLE district_profiles (
    district_name text PRIMARY KEY,
    population int,
    category text           -- 'Industrial', 'Residential', 'Commercial'
);
```

### Indexes

```sql
CREATE INDEX sensors_by_district ON sensors (district_name);
CREATE INDEX sensors_by_status ON sensors (status);
```

Lihat [DB_SCHEMA.md](../docs/DB_SCHEMA.md) untuk dokumentasi lengkap.

---

## 🔧 Useful Commands

### Access CQL Shell

```bash
docker exec -it smart-city-db cqlsh
```

### Describe Keyspace

```sql
USE smart_city;
DESCRIBE KEYSPACE smart_city;
```

### View Tables

```sql
DESCRIBE TABLES;
```

### Query Data

```sql
-- Lihat semua sensor
SELECT * FROM sensors;

-- Lihat district profiles
SELECT * FROM district_profiles;

-- Lihat energy logs terbaru
SELECT * FROM energy_logs LIMIT 10;

-- Count sensor per distrik
SELECT district_name, COUNT(*) 
FROM sensors 
GROUP BY district_name 
ALLOW FILTERING;
```

### Truncate Data (Reset)

```sql
-- Hapus semua data tanpa drop table
TRUNCATE sensors;
TRUNCATE energy_logs;
-- Note: district_profiles biasanya tidak di-truncate
```

### Drop Keyspace (Full Reset)

```sql
DROP KEYSPACE smart_city;
```

Kemudian jalankan ulang `init.cql`.

---

## 🐳 Docker Commands

### Start Container

```bash
docker start smart-city-db
```

### Stop Container

```bash
docker stop smart-city-db
```

### Remove Container

```bash
docker rm -f smart-city-db
```

### Container Logs

```bash
docker logs smart-city-db
docker logs -f smart-city-db  # Follow mode
```

### Container Status

```bash
docker ps | grep smart-city-db
```

---

## 📊 Sample Data

`init.cql` sudah menyertakan sample district profiles:

| District | Population | Category |
|----------|------------|----------|
| Jakarta Pusat | 1,200,000 | Commercial |
| Jakarta Selatan | 2,200,000 | Residential |
| Jakarta Utara | 1,800,000 | Industrial |
| Jakarta Barat | 2,400,000 | Residential |
| Jakarta Timur | 2,900,000 | Residential |

Sensor akan dibuat oleh simulator (`seed_sensors.py`).

---

## 🐛 Troubleshooting

### Cannot connect to Cassandra

```
Connection refused (os error 111)
```

**Solution:** Tunggu Cassandra fully ready (~30-60 detik):
```bash
docker logs smart-city-db | grep -i "listening"
```

### Keyspace already exists

Ini normal jika menjalankan `init.cql` multiple times. Script menggunakan `IF NOT EXISTS`.

### Out of memory

Cassandra membutuhkan minimal 2GB RAM. Cek Docker resource limits.

```bash
docker stats smart-city-db
```

### Permission denied

Pada Linux, mungkin perlu run dengan sudo:
```bash
sudo docker exec -it smart-city-db cqlsh
```

---

## 🔗 Related Documentation

- [Database Schema](../docs/DB_SCHEMA.md)
- [API Contract](../docs/API_CONTRACT.md)
- [Backend README](../backend-java/README.md)
