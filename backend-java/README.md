# 🔧 Smart City Energy - Backend (Java Spring Boot)

REST API backend untuk Smart City Energy Monitoring System menggunakan Spring Boot 3 dan Apache Cassandra.

## 📋 Prerequisites

- **Java:** 17 atau lebih tinggi
- **Maven:** 3.8+
- **Apache Cassandra:** 4.x (via Docker atau instalasi langsung)
- **Docker** (opsional, untuk deployment)

## 🚀 Quick Start

### 1. Setup Database

Pastikan Cassandra sudah berjalan dan database sudah diinisialisasi:

```bash
# Jalankan Cassandra (jika belum)
docker run --name smart-city-db -p 9042:9042 -d cassandra:latest

# Tunggu ~30 detik, lalu init database
docker cp ../database/init.cql smart-city-db:/init.cql
docker exec -it smart-city-db cqlsh -f /init.cql
```

### 2. Build & Run

```bash
# Build project
mvn clean install

# Run development server
mvn spring-boot:run
```

Server akan berjalan di `http://localhost:8080`

### 3. Verify

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Get all sensors
curl http://localhost:8080/api/v1/sensors
```

---

## 📁 Project Structure

```
backend-java/
├── src/main/java/com/smartcity/energy/
│   ├── SmartCityEnergyApplication.java   # Main entry point
│   ├── config/                           # Configuration
│   │   ├── CassandraConfig.java          # CqlSession setup
│   │   ├── CorsConfig.java               # CORS configuration
│   │   └── WebSocketConfig.java          # WebSocket (future)
│   ├── controller/                       # REST endpoints
│   │   ├── SensorController.java         # /sensors/*
│   │   ├── EnergyController.java         # /energy/*
│   │   ├── StatsController.java          # /stats/*
│   │   └── HealthController.java         # /health
│   ├── dto/                              # Request/Response DTOs
│   ├── model/                            # Domain entities
│   ├── repository/                       # CQL database access
│   └── service/                          # Business logic
├── src/main/resources/
│   └── application.properties            # App configuration
├── pom.xml                               # Maven config
├── Dockerfile                            # Docker build
└── docker-compose.yaml                   # Docker Compose
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/sensors` | Get all sensors |
| GET | `/api/v1/sensors/{id}` | Get sensor by ID |
| POST | `/api/v1/sensors` | Create new sensor |
| PUT | `/api/v1/sensors/{id}` | Update sensor |
| DELETE | `/api/v1/sensors/{id}` | Delete sensor |
| POST | `/api/v1/energy/ingest` | Ingest energy data |
| GET | `/api/v1/energy/latest/{id}` | Get latest reading |
| GET | `/api/v1/energy/history/{id}` | Get history by date |
| GET | `/api/v1/stats` | Get city statistics |
| GET | `/api/v1/stats/daily/{district}` | Get district stats |
| GET | `/api/v1/stats/hourly` | Get hourly aggregation |
| GET | `/api/v1/stats/districts` | Get all districts |

Lihat [API_CONTRACT.md](../docs/API_CONTRACT.md) untuk dokumentasi lengkap.

---

## ⚙️ Configuration

File: `src/main/resources/application.properties`

```properties
# Server
server.port=8080

# Cassandra Connection
cassandra.contact-points=localhost
cassandra.port=9042
cassandra.keyspace=smart_city
cassandra.local-datacenter=datacenter1

# CORS
cors.allowed-origins=http://localhost:3000

# Logging
logging.level.com.smartcity=DEBUG
```

### Environment Variables (Docker)

| Variable | Default | Description |
|----------|---------|-------------|
| `CASSANDRA_CONTACT_POINTS` | `cassandra` | Cassandra host |
| `CASSANDRA_PORT` | `9042` | Cassandra port |
| `CASSANDRA_KEYSPACE` | `smart_city` | Keyspace name |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t smart-city-backend .
```

### Run with Docker Compose

```bash
# Start Cassandra + Backend
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### docker-compose.yaml

```yaml
version: '3.8'
services:
  cassandra:
    image: cassandra:latest
    ports:
      - "9042:9042"
    volumes:
      - cassandra-data:/var/lib/cassandra
    healthcheck:
      test: ["CMD", "cqlsh", "-e", "describe keyspaces"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      cassandra:
        condition: service_healthy
    environment:
      - CASSANDRA_CONTACT_POINTS=cassandra
      - CASSANDRA_PORT=9042

volumes:
  cassandra-data:
```

---

## 🧪 Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

---

## 📊 Database Access

Proyek ini menggunakan **Raw CQL** tanpa ORM sesuai requirement:

```java
// Example: SensorRepository.java
@Repository
public class SensorRepository {
    private final CqlSession session;
    private PreparedStatement insertStmt;
    
    @PostConstruct
    public void init() {
        insertStmt = session.prepare(
            "INSERT INTO sensors (sensor_id, district_name, ...) VALUES (?, ?, ...)"
        );
    }
    
    public Sensor save(Sensor sensor) {
        BoundStatement bound = insertStmt.bind(
            sensor.getSensorId(),
            sensor.getDistrictName(),
            // ...
        );
        session.execute(bound);
        return sensor;
    }
}
```

---

## 🔧 Development

### Hot Reload

```bash
# Install Spring Boot DevTools (already in pom.xml)
mvn spring-boot:run
```

### Debug Mode

```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

---

## 📝 Notes

- **No ORM:** Semua database access menggunakan CqlSession + PreparedStatement
- **Async Writes:** Energy ingestion menggunakan async writes untuk throughput tinggi
- **Response Format:** Semua response menggunakan `ApiResponse<T>` wrapper

---

## 🔗 Related Documentation

- [API Contract](../docs/API_CONTRACT.md)
- [Database Schema](../docs/DB_SCHEMA.md)
- [Backend Structure](../docs/backend-file-structure.md)
