# Frontend File Structure - Next.js 14

```
frontend-next/
├── next.config.js               # Next.js configuration + API proxy
├── next-env.d.ts                # TypeScript environment definitions
├── package.json                 # NPM dependencies & scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── .env.local                   # Environment variables
│
├── components/                  # Root UI components (shadcn/ui)
│   └── ui/                      # Shadcn UI primitives
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (html, body)
│   │   ├── page.tsx             # Dashboard home page (/)
│   │   ├── globals.css          # Global styles + Tailwind
│   │   │
│   │   ├── analytics/           # Analytics page route
│   │   │   └── page.tsx         # /analytics - Charts & statistics
│   │   │
│   │   ├── map/                 # Map page route
│   │   │   └── page.tsx         # /map - Full interactive map
│   │   │
│   │   ├── sensors/             # Sensors management route
│   │   │   └── page.tsx         # /sensors - CRUD sensor table
│   │   │
│   │   └── settings/            # Settings page route
│   │       └── page.tsx         # /settings - App configuration
│   │
│   ├── components/              # Application components
│   │   ├── layout/              # Layout components
│   │   │   └── DashboardLayout.tsx   # Main dashboard wrapper
│   │   │
│   │   ├── map/                 # Map-related components
│   │   │   ├── MapContainer.tsx      # Leaflet map container
│   │   │   ├── MapLegend.tsx         # Map legend overlay
│   │   │   └── SensorMarker.tsx      # Custom sensor markers
│   │   │
│   │   ├── sensors/             # Sensor management components
│   │   │   ├── SensorManagement.tsx  # Main sensor table + actions
│   │   │   ├── SensorFormModal.tsx   # Create/Edit sensor modal
│   │   │   └── DeleteSensorModal.tsx # Delete confirmation modal
│   │   │
│   │   └── ui/                  # UI components
│   │       ├── Badge.tsx             # Status badge component
│   │       ├── Button.tsx            # Reusable button component
│   │       ├── Card.tsx              # Card container component
│   │       ├── Input.tsx             # Form input component
│   │       ├── Modal.tsx             # Modal dialog component
│   │       ├── Select.tsx            # Dropdown select component
│   │       ├── Table.tsx             # Data table component
│   │       ├── Toast.tsx             # Toast notification
│   │       │
│   │       ├── Sidebar.tsx           # Navigation sidebar
│   │       ├── StatsCards.tsx        # Statistics card row
│   │       ├── WeatherWidget.tsx     # Weather info widget
│   │       │
│   │       ├── DistrictPanel.tsx         # District info panel
│   │       ├── DistrictPanelCompact.tsx  # Compact district panel
│   │       ├── SensorDetail.tsx          # Sensor detail panel
│   │       ├── SensorDetailCompact.tsx   # Compact sensor detail
│   │       │
│   │       ├── EnergyChart.tsx           # Per-sensor energy chart
│   │       ├── EnergyTrendChart.tsx      # Energy trend chart
│   │       ├── HistoricalEnergyChart.tsx # Historical hourly chart
│   │       └── TotalEnergyChart.tsx      # Total city energy chart
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── api.ts               # API client functions
│   │   ├── fetcher.ts           # SWR fetcher function
│   │   ├── formatters.ts        # Data formatting utilities
│   │   ├── store.ts             # Zustand state store
│   │   └── utils.ts             # General utility functions
│   │
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Shared interfaces & types
│
└── public/                      # Static assets
```

---

## 📁 Directory Descriptions

### `src/app/` (App Router)
Next.js 14 App Router dengan file-based routing.

| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `page.tsx` | Dashboard utama dengan peta, stats, dan chart |
| `/analytics` | `analytics/page.tsx` | Halaman analitik dengan chart detail |
| `/map` | `map/page.tsx` | Peta interaktif full-screen |
| `/sensors` | `sensors/page.tsx` | Manajemen sensor (CRUD) |
| `/settings` | `settings/page.tsx` | Konfigurasi aplikasi |

### `src/components/layout/`
Layout components untuk struktur halaman.

| Component | Deskripsi |
|-----------|-----------|
| `DashboardLayout.tsx` | Wrapper dengan sidebar, header, dan content area |

### `src/components/map/`
Komponen untuk visualisasi peta Leaflet.

| Component | Deskripsi |
|-----------|-----------|
| `MapContainer.tsx` | Container utama peta Leaflet dengan tiles |
| `MapLegend.tsx` | Legend untuk status sensor dan energy source |
| `SensorMarker.tsx` | Custom marker dengan popup info sensor |

### `src/components/sensors/`
Komponen untuk manajemen sensor.

| Component | Deskripsi |
|-----------|-----------|
| `SensorManagement.tsx` | Tabel sensor dengan search, filter, pagination |
| `SensorFormModal.tsx` | Modal untuk create/edit sensor |
| `DeleteSensorModal.tsx` | Modal konfirmasi hapus sensor |

### `src/components/ui/`
Reusable UI components.

| Component | Deskripsi |
|-----------|-----------|
| `Badge.tsx` | Status badge (Active, Maintenance, Offline) |
| `Button.tsx` | Button dengan variants |
| `Card.tsx` | Card container |
| `Input.tsx` | Form input field |
| `Modal.tsx` | Modal dialog |
| `Select.tsx` | Dropdown select |
| `Table.tsx` | Data table |
| `Toast.tsx` | Toast notifications |
| `Sidebar.tsx` | Navigation sidebar |
| `StatsCards.tsx` | Row of statistics cards |
| `WeatherWidget.tsx` | Weather information widget |
| `DistrictPanel.tsx` | District information panel |
| `SensorDetail.tsx` | Selected sensor detail panel |
| `EnergyChart.tsx` | Per-sensor energy chart |
| `HistoricalEnergyChart.tsx` | Historical data chart (hourly) |
| `TotalEnergyChart.tsx` | Total city energy chart |

### `src/lib/`
Utility libraries dan helpers.

| File | Deskripsi |
|------|-----------|
| `api.ts` | API helper functions (apiGet, apiPost, etc.) |
| `fetcher.ts` | SWR fetcher dengan API base URL |
| `formatters.ts` | Number, date, currency formatters |
| `store.ts` | Zustand store untuk global state |
| `utils.ts` | General utility functions |

### `src/types/`
TypeScript type definitions.

| File | Deskripsi |
|------|-----------|
| `index.ts` | Shared interfaces (Sensor, EnergyReading, etc.) |

---

## 🔧 Key Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    
    "tailwindcss": "3.x",
    "lucide-react": "latest",
    
    "leaflet": "1.x",
    "react-leaflet": "4.x",
    
    "recharts": "2.x",
    "swr": "2.x",
    "zustand": "4.x"
  }
}
```

---

## 🚀 Running the Frontend

```bash
cd frontend-next

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

Frontend akan berjalan di `http://localhost:3000`

---

## ⚙️ Environment Variables

File: `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=/api/v1

# Weather API (optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_openweather_api_key
```

---

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Theme:** Dark mode (Glassmorphism)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Maps:** Leaflet + React-Leaflet
