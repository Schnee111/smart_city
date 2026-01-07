# Backend File Structure - Spring Boot

```
backend-java/
├── docker-compose.yaml          # Docker Compose untuk Cassandra + Backend
├── Dockerfile                   # Dockerfile untuk build backend image
├── pom.xml                      # Maven dependencies & build config
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── smartcity/
│       │           └── energy/
│       │               ├── SmartCityEnergyApplication.java   # Main entry point
│       │               │
│       │               ├── config/                           # Configuration classes
│       │               │   ├── CassandraConfig.java          # CqlSession bean setup
│       │               │   ├── CorsConfig.java               # CORS configuration
│       │               │   └── WebSocketConfig.java          # WebSocket config (future)
│       │               │
│       │               ├── controller/                       # REST API endpoints
│       │               │   ├── EnergyController.java         # /energy/* endpoints
│       │               │   ├── HealthController.java         # /health endpoint
│       │               │   ├── SensorController.java         # /sensors/* endpoints
│       │               │   └── StatsController.java          # /stats/* endpoints
│       │               │
│       │               ├── dto/                              # Data Transfer Objects
│       │               │   ├── ApiResponse.java              # Standard response wrapper
│       │               │   ├── CreateSensorRequest.java      # POST /sensors body
│       │               │   ├── UpdateSensorRequest.java      # PUT /sensors body
│       │               │   ├── EnergyIngestRequest.java      # POST /energy/ingest body
│       │               │   ├── EnergyLatestResponse.java     # Energy reading response
│       │               │   ├── SensorResponse.java           # Sensor with latest reading
│       │               │   ├── DistrictStatsResponse.java    # District statistics
│       │               │   └── HourlyStatsResponse.java      # Hourly aggregated stats
│       │               │
│       │               ├── model/                            # Domain models (POJO)
│       │               │   ├── Sensor.java                   # Sensor entity
│       │               │   ├── EnergyLog.java                # Energy log entity
│       │               │   └── DistrictProfile.java          # District profile entity
│       │               │
│       │               ├── repository/                       # Database access (Raw CQL)
│       │               │   ├── SensorRepository.java         # Sensor CRUD operations
│       │               │   ├── EnergyLogRepository.java      # Energy logs operations
│       │               │   └── DistrictProfileRepository.java # District profiles
│       │               │
│       │               └── service/                          # Business logic
│       │                   ├── SensorService.java            # Sensor business logic
│       │                   ├── EnergyService.java            # Energy data processing
│       │                   └── StatsService.java             # Statistics & aggregation
│       │
│       └── resources/
│           └── application.properties                        # App configuration
│
└── target/                                                   # Maven build output
    └── classes/
```

---

## 📁 Package Descriptions

### `config/`
Konfigurasi Spring Boot dan integrasi external services.

| File | Deskripsi |
|------|-----------|
| `CassandraConfig.java` | Setup `CqlSession` bean dengan connection ke Cassandra |
| `CorsConfig.java` | Konfigurasi CORS untuk akses dari frontend |
| `WebSocketConfig.java` | Konfigurasi WebSocket untuk real-time updates (future) |

### `controller/`
REST API endpoints yang menghandle HTTP requests.

| File | Endpoints | Deskripsi |
|------|-----------|-----------|
| `SensorController.java` | `/api/v1/sensors/*` | CRUD operations untuk sensor |
| `EnergyController.java` | `/api/v1/energy/*` | Ingest & query energy data |
| `StatsController.java` | `/api/v1/stats/*` | Statistics & analytics |
| `HealthController.java` | `/api/v1/health` | Health check endpoint |

### `dto/`
Data Transfer Objects untuk request/response serialization.

| File | Tipe | Deskripsi |
|------|------|-----------|
| `ApiResponse.java` | Response | Generic response wrapper dengan `success`, `message`, `data` |
| `CreateSensorRequest.java` | Request | Body untuk POST /sensors |
| `UpdateSensorRequest.java` | Request | Body untuk PUT /sensors |
| `EnergyIngestRequest.java` | Request | Body untuk POST /energy/ingest |
| `SensorResponse.java` | Response | Sensor dengan latest reading |
| `EnergyLatestResponse.java` | Response | Single energy reading |
| `DistrictStatsResponse.java` | Response | District statistics |
| `HourlyStatsResponse.java` | Response | Hourly aggregated data |

### `model/`
Plain Old Java Objects (POJO) untuk domain entities.

| File | Table | Deskripsi |
|------|-------|-----------|
| `Sensor.java` | sensors | Metadata sensor |
| `EnergyLog.java` | energy_logs | Time-series energy data |
| `DistrictProfile.java` | district_profiles | District context data |

### `repository/`
Database access layer dengan Raw CQL queries.

| File | Deskripsi |
|------|-----------|
| `SensorRepository.java` | CRUD + queries untuk sensors table |
| `EnergyLogRepository.java` | Insert + range queries untuk energy_logs |
| `DistrictProfileRepository.java` | Queries untuk district_profiles |

> ⚠️ **Important:** Semua repository menggunakan `CqlSession` dan `PreparedStatement`, TIDAK menggunakan ORM.

### `service/`
Business logic layer yang mengorkestrasikan repository calls.

| File | Deskripsi |
|------|-----------|
| `SensorService.java` | Sensor management + latest reading enrichment |
| `EnergyService.java` | Energy data ingestion + history retrieval |
| `StatsService.java` | Aggregation & statistics calculation |

---

## 🔧 Key Dependencies (pom.xml)

```xml
<!-- Spring Boot 3 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<!-- Dependencies -->
<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- DataStax Java Driver for Cassandra -->
    <dependency>
        <groupId>com.datastax.oss</groupId>
        <artifactId>java-driver-core</artifactId>
        <version>4.17.0</version>
    </dependency>
</dependencies>
```

---

## 🚀 Running the Backend

### Development (tanpa Docker)
```bash
cd backend-java
mvn clean install
mvn spring-boot:run
```

### Production (dengan Docker)
```bash
cd backend-java
docker-compose up -d
```

Server akan berjalan di `http://localhost:8080`
