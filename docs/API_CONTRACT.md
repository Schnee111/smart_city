# API Contract - Smart City Energy Monitoring

**Base URL:** `/api/v1`  
**Backend:** Spring Boot 3 + Java 17  
**Format:** JSON  
**Response Wrapper:** `ApiResponse<T>`

## Response Format

Semua response menggunakan format standar:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## 🔌 Sensor Endpoints

### [GET] /sensors
Mendapatkan semua sensor dengan data reading terakhir.

**Response:**
```json
{
  "success": true,
  "message": "Sensors retrieved successfully",
  "data": [
    {
      "sensorId": "uuid-string",
      "districtName": "Jakarta Pusat",
      "latitude": -6.1751,
      "longitude": 106.8650,
      "energySource": "Solar",
      "status": "Active",
      "createdAt": "2026-01-07T10:00:00Z",
      "latestReading": {
        "kwhUsage": 5.25,
        "voltage": 220,
        "recordedAt": "2026-01-07T12:30:00Z"
      }
    }
  ]
}
```

### [GET] /sensors/{sensorId}
Mendapatkan detail sensor berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "sensorId": "uuid-string",
    "districtName": "Jakarta Selatan",
    "latitude": -6.2615,
    "longitude": 106.8106,
    "energySource": "Grid",
    "status": "Active",
    "createdAt": "2026-01-07T10:00:00Z",
    "latestReading": { ... }
  }
}
```

### [POST] /sensors
Membuat sensor baru.

**Request Body:**
```json
{
  "districtName": "Jakarta Pusat",
  "latitude": -6.1751,
  "longitude": 106.8650,
  "energySource": "Solar"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Sensor created successfully",
  "data": {
    "sensorId": "new-uuid-string",
    "districtName": "Jakarta Pusat",
    "status": "Active",
    ...
  }
}
```

### [PUT] /sensors/{sensorId}
Memperbarui data sensor.

**Request Body:**
```json
{
  "districtName": "Jakarta Pusat",
  "latitude": -6.1751,
  "longitude": 106.8650,
  "energySource": "Grid",
  "status": "Maintenance"
}
```

**Response:** `200 OK`

### [DELETE] /sensors/{sensorId}
Menghapus sensor.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Sensor deleted successfully"
}
```

---

## ⚡ Energy Endpoints

### [POST] /energy/ingest
Menerima data energi dari simulator Python.

**Request Body:**
```json
{
  "sensorId": "uuid-string",
  "kwhUsage": 5.25,
  "voltage": 220
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Energy data ingested",
  "data": {
    "sensorId": "uuid-string",
    "kwhUsage": 5.25,
    "voltage": 220,
    "recordedAt": "2026-01-07T12:30:00Z"
  }
}
```

### [GET] /energy/latest/{sensorId}
Mendapatkan pembacaan terakhir untuk sensor.

**Response:**
```json
{
  "success": true,
  "data": {
    "sensorId": "uuid-string",
    "kwhUsage": 5.25,
    "voltage": 220,
    "recordedAt": "2026-01-07T12:30:00Z"
  }
}
```

### [GET] /energy/history/{sensorId}?date=YYYY-MM-DD
Mendapatkan riwayat pembacaan sensor untuk tanggal tertentu.

**Query Parameters:**
- `date` (optional): Tanggal dalam format `YYYY-MM-DD`. Default: hari ini.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sensorId": "uuid-string",
      "kwhUsage": 5.25,
      "voltage": 220,
      "recordedAt": "2026-01-07T12:30:00Z"
    },
    ...
  ]
}
```

---

## 📊 Statistics Endpoints

### [GET] /stats
Mendapatkan statistik keseluruhan kota.

**Response:**
```json
{
  "success": true,
  "data": {
    "districtName": "All Districts",
    "totalKwh": 1250.75,
    "solarRatio": 35.50,
    "totalSensors": 25,
    "activeSensors": 23,
    "avgVoltage": 221.5
  }
}
```

### [GET] /stats/daily/{district}
Mendapatkan statistik harian per distrik.

**Response:**
```json
{
  "success": true,
  "data": {
    "districtName": "Jakarta Pusat",
    "totalKwh": 450.25,
    "solarRatio": 40.00,
    "totalSensors": 8,
    "activeSensors": 7,
    "avgVoltage": 220.5
  }
}
```

### [GET] /stats/districts
Mendapatkan semua profil distrik.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "districtName": "Jakarta Pusat",
      "population": 1200000,
      "category": "Commercial"
    },
    ...
  ]
}
```

### [GET] /stats/hourly?date=YYYY-MM-DD
Mendapatkan statistik agregat per jam untuk chart.

**Query Parameters:**
- `date` (optional): Tanggal dalam format `YYYY-MM-DD`. Default: hari ini.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "hour": 0,
      "timeLabel": "00:00",
      "totalKwh": 125.50,
      "solarKwh": 0,
      "gridKwh": 125.50,
      "readingCount": 150
    },
    {
      "hour": 1,
      "timeLabel": "01:00",
      "totalKwh": 120.25,
      "solarKwh": 0,
      "gridKwh": 120.25,
      "readingCount": 148
    },
    ...
  ]
}
```

---

## 🏥 Health Endpoint

### [GET] /health
Mengecek status kesehatan backend dan koneksi database.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-07T12:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: field is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Sensor not found: uuid-string"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
