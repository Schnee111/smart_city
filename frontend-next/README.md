# 🌐 Smart City Energy - Frontend (Next.js)

Dashboard frontend untuk Smart City Energy Monitoring System menggunakan Next.js 14, Tailwind CSS, dan Recharts.

## 📋 Prerequisites

- **Node.js:** 18 atau lebih tinggi
- **npm** atau **yarn**
- **Backend API** berjalan di `http://localhost:8080`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 2. Configure Environment

Buat file `.env.local`:

```env
# API Configuration (proxy ke backend)
NEXT_PUBLIC_API_URL=/api/v1

# Weather API (optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_openweather_api_key
```

### 3. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Dashboard akan tersedia di `http://localhost:3000`

---

## 📁 Project Structure

```
frontend-next/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Dashboard home (/)
│   │   ├── analytics/page.tsx   # Analytics page
│   │   ├── map/page.tsx         # Full map page
│   │   ├── sensors/page.tsx     # Sensor management
│   │   └── settings/page.tsx    # Settings page
│   │
│   ├── components/              # React components
│   │   ├── layout/              # Layout components
│   │   ├── map/                 # Leaflet map components
│   │   ├── sensors/             # Sensor CRUD components
│   │   └── ui/                  # UI components
│   │
│   ├── lib/                     # Utilities
│   │   ├── api.ts               # API client
│   │   ├── fetcher.ts           # SWR fetcher
│   │   ├── store.ts             # Zustand store
│   │   └── utils.ts             # Helpers
│   │
│   └── types/                   # TypeScript types
│       └── index.ts
│
├── public/                      # Static assets
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
└── package.json
```

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard utama dengan peta, stats, dan chart |
| `/analytics` | Halaman analitik dengan chart detail dan historical data |
| `/map` | Peta interaktif full-screen dengan semua sensor |
| `/sensors` | Manajemen sensor (Create, Read, Update, Delete) |
| `/settings` | Konfigurasi aplikasi |

---

## 🎨 Features

### Dashboard (/)
- 📊 **Stats Cards:** Total konsumsi, sensor aktif, rata-rata solar
- 🗺️ **Mini Map:** Preview peta dengan sensor markers
- 📈 **Energy Chart:** Tren konsumsi energi real-time
- 🌤️ **Weather Widget:** Informasi cuaca kota

### Analytics (/analytics)
- 📊 **Historical Chart:** Data konsumsi per jam (Live/Today/History)
- 🏢 **District Comparison:** Perbandingan konsumsi antar distrik
- 🔄 **View Modes:** Total city atau per sensor
- 📅 **Date Picker:** Pilih tanggal untuk historical data

### Map (/map)
- 🗺️ **Interactive Map:** Leaflet dengan OpenStreetMap tiles
- 📍 **Sensor Markers:** Marker dengan warna berdasarkan status
- 📊 **Popup Info:** Detail sensor dan reading terakhir
- 🔍 **District Filter:** Filter sensor berdasarkan distrik

### Sensors (/sensors)
- 📋 **Data Table:** Tabel sensor dengan sorting dan filtering
- ➕ **Create:** Tambah sensor baru
- ✏️ **Edit:** Update data sensor
- 🗑️ **Delete:** Hapus sensor dengan konfirmasi
- 🔍 **Search:** Cari sensor berdasarkan ID atau distrik

---

## ⚙️ Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Proxy ke backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Tailwind Theme

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom colors for dark theme
      },
    },
  },
  plugins: [],
};
```

---

## 🔧 Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 14.x | React framework |
| `react` | 18.x | UI library |
| `tailwindcss` | 3.x | CSS framework |
| `recharts` | 2.x | Charts library |
| `leaflet` | 1.x | Map library |
| `react-leaflet` | 4.x | React wrapper for Leaflet |
| `swr` | 2.x | Data fetching & caching |
| `zustand` | 4.x | State management |
| `lucide-react` | latest | Icons |

---

## 📦 Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🎯 State Management

### Zustand Store

```typescript
// lib/store.ts
interface DashboardState {
  selectedSensor: Sensor | null;
  selectedDistrict: string | null;
  setSelectedSensor: (sensor: Sensor | null) => void;
  setSelectedDistrict: (district: string | null) => void;
}
```

### SWR Data Fetching

```typescript
// Contoh penggunaan SWR
const { data: sensors, isLoading } = useSWR<Sensor[]>(
  '/sensors',
  fetcher,
  { refreshInterval: 5000 }
);
```

---

## 🌙 Theme

Aplikasi menggunakan dark theme dengan glassmorphism design:

- **Background:** Slate gradients
- **Cards:** Semi-transparent dengan backdrop blur
- **Borders:** Subtle slate borders
- **Accent:** Emerald untuk primary actions
- **Status Colors:**
  - 🟢 Emerald: Active
  - 🟡 Amber: Maintenance
  - 🔴 Red: Offline
  - 🟣 Purple: Solar

---

## 🐛 Troubleshooting

### Map tidak muncul
```bash
# Pastikan CSS Leaflet di-import
# Di layout.tsx atau globals.css:
import 'leaflet/dist/leaflet.css';
```

### API Error 404
```bash
# Pastikan backend berjalan dan next.config.js memiliki rewrite rules
# Check: curl http://localhost:8080/api/v1/health
```

### Hydration Error
```bash
# Gunakan dynamic import untuk Leaflet components
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
});
```

---

## 🔗 Related Documentation

- [API Contract](../docs/API_CONTRACT.md)
- [Frontend Structure](../docs/frontend-file-structure.md)
