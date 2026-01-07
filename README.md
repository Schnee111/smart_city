# 🏙️ Smart City Energy Monitoring System (SCEM)

**Proyek Mata Kuliah NoSQL - Apache Cassandra**

Sistem pemantauan energi pintar berbasis IoT untuk skala perkotaan (Multi-distrik) dengan teknologi Apache Cassandra sebagai database NoSQL.

<img width="1919" height="1069" alt="image" src="https://github.com/user-attachments/assets/905a51e2-f38f-44f9-a897-ad2c5ebd127f" />


---

## 🎯 Tujuan Proyek

- **SDG 7**: Energi Bersih & Terjangkau
- **SDG 11**: Kota & Pemukiman Berkelanjutan
- Mengelola inventaris sensor (CRUD) dan memvisualisasikan data penggunaan energi time-series secara real-time

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| **Database** | Apache Cassandra (Wide-column Store) | 4.x |
| **Backend** | Java Spring Boot + DataStax Driver | 3.2 / 4.17 |
| **Frontend** | Next.js + Tailwind CSS + Recharts | 14.x |
| **Map** | Leaflet.js + React-Leaflet | 1.x / 4.x |
| **Simulator** | Python + Requests | 3.8+ |
| **Container** | Docker + Docker Compose | Latest |

> ⚠️ **Golden Rule**: TIDAK MENGGUNAKAN ORM. Semua interaksi database menggunakan Raw CQL via `CqlSession` dan `PreparedStatement`.

---

## 📁 Struktur Proyek

```
smart_city/
├── README.md                    # Dokumentasi utama (file ini)
│
├── database/                    # Database scripts
│   ├── init.cql                 # CQL initialization script
│   └── README.md                # Database documentation
│
├── backend-java/                # Spring Boot REST API
│   ├── src/                     # Source code
│   ├── pom.xml                  # Maven dependencies
│   ├── Dockerfile               # Docker build file
│   ├── docker-compose.yaml      # Docker Compose config
│   └── README.md                # Backend documentation
│
├── frontend-next/               # Next.js Dashboard
│   ├── src/                     # Source code (App Router)
│   ├── package.json             # NPM dependencies
│   └── README.md                # Frontend documentation
│
├── simulator-python/            # Python data simulator
│   ├── scripts/                 # Simulator scripts
│   ├── data/                    # Configuration data
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Simulator documentation
│
└── docs/                        # Project documentation
    ├── API_CONTRACT.md          # API endpoints documentation
    ├── DB_SCHEMA.md             # Database schema documentation
    ├── backend-file-structure.md
    ├── frontend-file-structure.md
    └── simulator-structure.md
```

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop
- Java 17+
- Node.js 18+
- Python 3.8+
- Maven 3.8+

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smart-city-energy.git
cd smart-city-energy
```

### 2. Setup Database (Cassandra)

```bash
# Jalankan Cassandra container
docker run --name smart-city-db -p 9042:9042 -d cassandra:latest

# Tunggu ~30 detik sampai Cassandra ready
docker logs smart-city-db | grep "Starting listening"

# Inisialisasi database
docker cp database/init.cql smart-city-db:/init.cql
docker exec -it smart-city-db cqlsh -f /init.cql

# Verifikasi
docker exec -it smart-city-db cqlsh -e "USE smart_city; DESCRIBE TABLES;"
```

### 3. Run Backend (Spring Boot)

```bash
cd backend-java

# Build & Run
mvn clean install -DskipTests
mvn spring-boot:run

# Verify
curl http://localhost:8080/api/v1/health
```

Backend berjalan di `http://localhost:8080`

### 4. Run Frontend (Next.js)

```bash
cd frontend-next

# Install dependencies
npm install

# Run development server
npm run dev
```

Dashboard tersedia di `http://localhost:3000`

### 5. Run Simulator (Python)

```bash
cd simulator-python

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed sensors
python scripts/seed_sensors.py

# Run simulator
python scripts/sensor_gen.py
```

---

## 🐳 Docker Deployment

### Full Stack dengan Docker Compose

```bash
cd backend-java

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/health` | Health check |
| **Sensors** |
| GET | `/api/v1/sensors` | Daftar semua sensor + latest reading |
| GET | `/api/v1/sensors/{id}` | Detail sensor |
| POST | `/api/v1/sensors` | Registrasi sensor baru |
| PUT | `/api/v1/sensors/{id}` | Update sensor |
| DELETE | `/api/v1/sensors/{id}` | Hapus sensor |
| **Energy** |
| POST | `/api/v1/energy/ingest` | Ingest data dari simulator |
| GET | `/api/v1/energy/latest/{id}` | Pembacaan terakhir sensor |
| GET | `/api/v1/energy/history/{id}` | Riwayat pembacaan per tanggal |
| **Statistics** |
| GET | `/api/v1/stats` | Statistik kota keseluruhan |
| GET | `/api/v1/stats/daily/{district}` | Statistik per distrik |
| GET | `/api/v1/stats/hourly` | Agregasi per jam (untuk chart) |
| GET | `/api/v1/stats/districts` | Daftar profil distrik |

Lihat [API_CONTRACT.md](docs/API_CONTRACT.md) untuk dokumentasi lengkap.

---

## 📊 Dashboard Features

### 🏠 Dashboard Utama (/)
- **Stats Cards**: Total konsumsi, sensor aktif, rasio solar
- **Mini Map**: Preview peta dengan marker sensor
- **Energy Chart**: Tren konsumsi real-time
- **Weather Widget**: Informasi cuaca kota

### 📈 Analytics (/analytics)
- **Historical Chart**: Data konsumsi per jam (Live/Today/History)
- **District Comparison**: Perbandingan konsumsi antar distrik
- **Energy Distribution**: Pie chart distribusi Solar vs Grid
- **View Modes**: Total kota atau per sensor

### 🗺️ Map (/map)
- **Interactive Map**: Peta Leaflet dengan OpenStreetMap
- **Sensor Markers**: Marker dengan warna berdasarkan status
- **Popup Info**: Detail sensor dan reading terakhir
- **District Filter**: Filter sensor per distrik

### ⚙️ Sensors (/sensors)
- **Data Table**: Tabel sensor dengan sorting & filtering
- **CRUD Operations**: Create, Read, Update, Delete sensor
- **Search**: Cari sensor berdasarkan ID atau distrik
- **Status Management**: Ubah status sensor

---

## 🗄️ Database Schema

### Tables

```sql
-- 1. Sensors (Metadata)
CREATE TABLE sensors (
    sensor_id uuid PRIMARY KEY,
    district_name text,
    latitude decimal,
    longitude decimal,
    energy_source text,     -- 'Solar' atau 'Grid'
    status text,            -- 'Active', 'Maintenance', 'Offline'
    created_at timestamp
);

-- 2. Energy Logs (Time-Series)
CREATE TABLE energy_logs (
    sensor_id uuid,
    event_date date,
    recorded_at timestamp,
    kwh_usage decimal,
    voltage int,
    PRIMARY KEY ((sensor_id, event_date), recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC);

-- 3. District Profiles
CREATE TABLE district_profiles (
    district_name text PRIMARY KEY,
    population int,
    category text           -- 'Industrial', 'Residential', 'Commercial'
);
```

Lihat [DB_SCHEMA.md](docs/DB_SCHEMA.md) untuk dokumentasi lengkap.

---

## 🔧 Configuration

### Backend (application.properties)

```properties
server.port=8080
cassandra.contact-points=localhost
cassandra.port=9042
cassandra.keyspace=smart_city
cors.allowed-origins=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_WEATHER_API_KEY=your_key
```

### Simulator (.env)

```env
API_BASE_URL=http://localhost:8080/api/v1
INTERVAL_SECONDS=5
```

---

## 📚 Documentation

| Document | Deskripsi |
|----------|-----------|
| [API_CONTRACT.md](docs/API_CONTRACT.md) | REST API endpoints & examples |
| [DB_SCHEMA.md](docs/DB_SCHEMA.md) | Cassandra table schemas |
| [backend-file-structure.md](docs/backend-file-structure.md) | Backend project structure |
| [frontend-file-structure.md](docs/frontend-file-structure.md) | Frontend project structure |
| [simulator-structure.md](docs/simulator-structure.md) | Simulator project structure |

---

## 🧪 Testing

### Backend

```bash
cd backend-java
mvn test
```

### Frontend

```bash
cd frontend-next
npm run lint
npm run type-check
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

Proyek ini dibuat untuk keperluan akademik mata kuliah NoSQL.

---

## 🙏 Acknowledgments

- Apache Cassandra Documentation
- Spring Boot Documentation
- Next.js Documentation
- Leaflet.js Documentation
- DataStax Java Driver

---

**Smart City Energy Monitoring System © 2026**

*Monitoring energi untuk kota yang lebih hijau dan berkelanjutan* 🌱
