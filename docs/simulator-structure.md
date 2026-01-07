# Simulator File Structure - Python

```
simulator-python/
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
├── README.md                    # Simulator documentation
│
├── data/
│   └── districts.json           # District configuration data
│
└── scripts/
    ├── seed_sensors.py          # Sensor seeder script
    └── sensor_gen.py            # Energy data generator
```

---

## 📁 File Descriptions

### `requirements.txt`
Python dependencies untuk menjalankan simulator.

```
requests>=2.28.0
python-dotenv>=1.0.0
```

### `.env`
Environment variables untuk konfigurasi simulator.

```env
API_BASE_URL=http://localhost:8080/api/v1
INTERVAL_SECONDS=5
VOLTAGE_MIN=210
VOLTAGE_MAX=240
KWH_MIN=0.5
KWH_MAX=15.0
```

### `data/districts.json`
Konfigurasi distrik dan jumlah sensor yang akan di-generate.

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
    }
  ]
}
```

---

## 📜 Scripts

### `seed_sensors.py`
Script untuk membuat sensor awal di backend.

**Fitur:**
- Membaca konfigurasi dari `data/districts.json`
- Membuat sensor via POST `/api/v1/sensors`
- Generate koordinat random di sekitar pusat distrik
- Skip jika sensor sudah ada

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
  ✅ Created: Jakarta Pusat (Solar) - ID: e5f6g7h8...
  ✅ Created: Jakarta Pusat (Grid) - ID: i9j0k1l2...
...
✅ Seeding complete! Created 25 sensors.
```

---

### `sensor_gen.py`
Script untuk generate dan mengirim data energi ke backend secara real-time.

**Fitur:**
- Fetch daftar sensor dari backend secara dinamis
- Generate kWh berdasarkan jenis energi (Solar/Grid)
- Solar: produksi lebih tinggi di siang hari
- Generate voltage dalam range normal (210-240V)
- Kirim data setiap N detik (configurable)
- Handle sensor baru yang ditambahkan saat runtime

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
...
```

**Flow:**
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Fetch Sensors  │────▶│  Generate Data   │────▶│  POST /ingest   │
│  GET /sensors   │     │  Random kWh, V   │     │  Energy Data    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                               │
         └───────────────── Loop setiap N detik ─────────┘
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL backend API |
| `INTERVAL_SECONDS` | `5` | Interval pengiriman data (detik) |
| `VOLTAGE_MIN` | `210` | Minimum voltage (V) |
| `VOLTAGE_MAX` | `240` | Maximum voltage (V) |
| `KWH_MIN` | `0.5` | Minimum kWh usage |
| `KWH_MAX` | `15.0` | Maximum kWh usage |

### Solar Energy Simulation

```python
# Solar produces based on time of day
if 6 <= hour <= 18:  # Daytime (6 AM - 6 PM)
    kwh = random.uniform(KWH_MIN * 2, KWH_MAX)  # Higher production
else:  # Night
    kwh = random.uniform(0, KWH_MIN)  # Minimal production
```

---

## 🚀 Running the Simulator

### 1. Setup Environment
```bash
cd simulator-python

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy dan edit .env
cp .env.example .env
# Edit API_BASE_URL jika backend tidak di localhost
```

### 3. Seed Sensors (Optional)
```bash
python scripts/seed_sensors.py
```

### 4. Run Simulator
```bash
python scripts/sensor_gen.py
```

### 5. Stop Simulator
Press `Ctrl+C` to stop gracefully.

---

## 📊 Data Generation Logic

### kWh Usage
- **Solar (Daytime):** 1.0 - 15.0 kWh
- **Solar (Night):** 0.0 - 0.5 kWh
- **Grid:** 0.5 - 15.0 kWh (constant)

### Voltage
- Range: 210V - 240V
- Distribution: Uniform random

### Coordinate Generation
- Base: District center coordinates
- Offset: ±0.02° (~2km radius)

```python
DISTRICT_CENTERS = {
    'Jakarta Pusat': (-6.1751, 106.8650),
    'Jakarta Selatan': (-6.2615, 106.8106),
    'Jakarta Utara': (-6.1214, 106.9004),
    'Jakarta Barat': (-6.1681, 106.7588),
    'Jakarta Timur': (-6.2250, 106.9004),
}
```
