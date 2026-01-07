# 🐍 Smart City Energy - Simulator (Python)

Data simulator untuk Smart City Energy Monitoring System. Mengirim data energi secara real-time ke backend API.

## 📋 Prerequisites

- **Python:** 3.8 atau lebih tinggi
- **pip:** Package manager Python
- **Backend API** berjalan di `http://localhost:8080`

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd simulator-python

# (Opsional) Buat virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure

Buat atau edit file `.env`:

```env
API_BASE_URL=http://localhost:8080/api/v1
INTERVAL_SECONDS=5
VOLTAGE_MIN=210
VOLTAGE_MAX=240
KWH_MIN=0.5
KWH_MAX=15.0
```

### 3. Seed Sensors (Opsional)

Jika database kosong, jalankan seeder untuk membuat sensor awal:

```bash
python scripts/seed_sensors.py
```

### 4. Run Simulator

```bash
python scripts/sensor_gen.py
```

Tekan `Ctrl+C` untuk menghentikan simulator.

---

## 📁 Project Structure

```
simulator-python/
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
├── README.md                    # This file
│
├── data/
│   └── districts.json           # District configuration
│
└── scripts/
    ├── seed_sensors.py          # Sensor seeder script
    └── sensor_gen.py            # Energy data generator
```

---

## 📜 Scripts

### `seed_sensors.py`

Membuat sensor awal di backend berdasarkan konfigurasi `data/districts.json`.

**Usage:**
```bash
python scripts/seed_sensors.py
```

**Output:**
```
🌱 Sensor Seeder
================
📊 Found 0 existing sensors
🔄 Seeding sensors for 5 districts...
  ✅ Created: Jakarta Pusat (Solar) - ID: a1b2c3d4...
  ✅ Created: Jakarta Pusat (Grid) - ID: e5f6g7h8...
  ...
✅ Seeding complete! Created 25 sensors.
```

**Features:**
- Membaca konfigurasi dari `data/districts.json`
- Generate koordinat random di sekitar pusat distrik
- Skip jika sensor sudah ada

---

### `sensor_gen.py`

Mengirim data energi secara real-time ke backend.

**Usage:**
```bash
python scripts/sensor_gen.py
```

**Output:**
```
⚡ Smart City Energy Simulator
================================
🔄 Starting simulation...
✅ Fetched 25 sensors from backend

📤 Sent 25/25 readings | Total: 127.5 kWh | Avg Voltage: 221V
📤 Sent 25/25 readings | Total: 131.2 kWh | Avg Voltage: 219V
📤 Sent 25/25 readings | Total: 125.8 kWh | Avg Voltage: 223V
...

Ctrl+C detected. Stopping simulation...
✅ Simulation stopped gracefully.
```

**Features:**
- Fetch daftar sensor dari backend (dinamis)
- Detect sensor baru yang ditambahkan saat runtime
- Generate kWh berdasarkan jenis energi:
  - **Solar:** Produksi tinggi siang hari (6 AM - 6 PM)
  - **Grid:** Konsumsi konstan sepanjang hari
- Generate voltage dalam range normal
- Retry logic jika koneksi terputus
- Graceful shutdown dengan Ctrl+C

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:8080/api/v1` | Backend API URL |
| `INTERVAL_SECONDS` | `5` | Interval pengiriman data (detik) |
| `VOLTAGE_MIN` | `210` | Minimum voltage (V) |
| `VOLTAGE_MAX` | `240` | Maximum voltage (V) |
| `KWH_MIN` | `0.5` | Minimum kWh consumption |
| `KWH_MAX` | `15.0` | Maximum kWh consumption |

### District Configuration

File: `data/districts.json`

```json
{
  "districts": [
    {
      "name": "Jakarta Pusat",
      "sensors": {
        "Solar": 3,
        "Grid": 2
      }
    },
    {
      "name": "Jakarta Selatan",
      "sensors": {
        "Solar": 2,
        "Grid": 3
      }
    },
    {
      "name": "Jakarta Utara",
      "sensors": {
        "Solar": 2,
        "Grid": 3
      }
    },
    {
      "name": "Jakarta Barat",
      "sensors": {
        "Solar": 3,
        "Grid": 2
      }
    },
    {
      "name": "Jakarta Timur",
      "sensors": {
        "Solar": 2,
        "Grid": 3
      }
    }
  ]
}
```

---

## 📊 Data Generation Logic

### kWh Usage

```python
# Solar energy - time-based production
if sensor.energy_source == 'Solar':
    hour = datetime.now().hour
    if 6 <= hour <= 18:  # Daytime
        kwh = random.uniform(KWH_MIN * 2, KWH_MAX)  # 1.0 - 15.0
    else:  # Night
        kwh = random.uniform(0, KWH_MIN)  # 0.0 - 0.5
else:
    # Grid - constant consumption
    kwh = random.uniform(KWH_MIN, KWH_MAX)  # 0.5 - 15.0
```

### Voltage

```python
voltage = random.randint(VOLTAGE_MIN, VOLTAGE_MAX)  # 210 - 240V
```

### Coordinates

```python
# District centers
DISTRICT_CENTERS = {
    'Jakarta Pusat': (-6.1751, 106.8650),
    'Jakarta Selatan': (-6.2615, 106.8106),
    'Jakarta Utara': (-6.1214, 106.9004),
    'Jakarta Barat': (-6.1681, 106.7588),
    'Jakarta Timur': (-6.2250, 106.9004),
}

# Random offset ±0.02° (~2km radius)
lat = center_lat + random.uniform(-0.02, 0.02)
lon = center_lon + random.uniform(-0.02, 0.02)
```

---

## 🔄 Simulation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        STARTUP                                   │
│  1. Load environment variables                                   │
│  2. Fetch existing sensors from API                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN LOOP                                   │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │ Refresh sensors │───▶│ Generate reading │───▶│ POST /ingest│ │
│  │ (every N loops) │    │ for each sensor  │    │ to backend  │ │
│  └─────────────────┘    └──────────────────┘    └─────────────┘ │
│                              │                                   │
│                              ▼                                   │
│                     Sleep INTERVAL_SECONDS                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SHUTDOWN (Ctrl+C)                           │
│  Graceful cleanup and exit                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Connection Error

```
❌ Cannot connect to backend. Is the Spring Boot server running?
   URL: http://localhost:8080/api/v1
```

**Solution:** Pastikan backend sudah berjalan:
```bash
cd ../backend-java
mvn spring-boot:run
```

### No Sensors Found

```
⚠️  No sensors found. Waiting for sensors to be registered...
```

**Solution:** Jalankan seeder atau tambah sensor manual:
```bash
python scripts/seed_sensors.py
```

### Module Not Found

```
ModuleNotFoundError: No module named 'requests'
```

**Solution:** Install dependencies:
```bash
pip install -r requirements.txt
```

---

## 📝 Requirements

File: `requirements.txt`

```
requests>=2.28.0
python-dotenv>=1.0.0
```

---

## 🔗 Related Documentation

- [API Contract](../docs/API_CONTRACT.md)
- [Simulator Structure](../docs/simulator-structure.md)
