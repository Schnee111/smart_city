'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import useSWR from 'swr';
import { RefreshCw, Maximize2, Minus, Plus } from 'lucide-react';
import { fetcher } from '@/src/lib/fetcher';
import { useDashboardStore } from '@/src/lib/store';
import { Sensor } from '@/src/types';
import SensorMarker from './SensorMarker';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';

// Jakarta center coordinates
const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 11;

// District center coordinates for auto-zoom
const DISTRICT_CENTERS: Record<string, { coords: [number, number], zoom: number }> = {
  'Jakarta Pusat': { coords: [-6.1862, 106.8063], zoom: 13 },
  'Jakarta Selatan': { coords: [-6.2615, 106.8106], zoom: 12 },
  'Jakarta Utara': { coords: [-6.1380, 106.8827], zoom: 12 },
  'Jakarta Barat': { coords: [-6.1670, 106.7390], zoom: 12 },
  'Jakarta Timur': { coords: [-6.2250, 106.9004], zoom: 12 },
  'Kepulauan Seribu': { coords: [-5.6108, 106.5260], zoom: 11 }
};

// Map styles
const MAP_STYLES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// Component to handle map flyTo with offset for better UX
function MapController() {
  const map = useMap();
  const { selectedSensor, selectedDistrict } = useDashboardStore();

  // Handle sensor selection - zoom to specific sensor
  useEffect(() => {
    if (selectedSensor) {
      // Calculate offset to position marker in lower portion of viewport
      // This ensures any popup/tooltip doesn't get cut off at the top
      const mapSize = map.getSize();
      const targetPoint = map.project([selectedSensor.latitude, selectedSensor.longitude], 14);
      const offsetPoint = L.point(targetPoint.x, targetPoint.y - mapSize.y * 0.15);
      const targetLatLng = map.unproject(offsetPoint, 14);
      
      map.flyTo(targetLatLng, 14, { 
        duration: 0.8,
        easeLinearity: 0.5
      });
    }
  }, [selectedSensor, map]);

  // Handle district selection - zoom to district area
  useEffect(() => {
    if (selectedDistrict) {
      const districtInfo = DISTRICT_CENTERS[selectedDistrict];
      if (districtInfo) {
        map.flyTo(districtInfo.coords, districtInfo.zoom, {
          duration: 1.0,
          easeLinearity: 0.5
        });
      }
    } else {
      // Reset to default view when no district selected
      map.flyTo(JAKARTA_CENTER, DEFAULT_ZOOM, {
        duration: 1.0,
        easeLinearity: 0.5
      });
    }
  }, [selectedDistrict, map]);

  return null;
}

// Custom zoom controls
function CustomControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="w-9 h-9 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-9 h-9 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.setView(JAKARTA_CENTER, DEFAULT_ZOOM)}
        className="w-9 h-9 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
        title="Reset view"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface MapContainerProps {
  height?: string;
  showLegend?: boolean;
  showControls?: boolean;
}

export default function MapContainer({ 
  height = '100%', 
  showLegend = true,
  showControls = true 
}: MapContainerProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('dark');
  const { selectedDistrict } = useDashboardStore();

  // Fetch sensors with polling every 5 seconds
  const { data: sensors, error, isLoading, mutate } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 5000 }
  );

  // Ensure client-side only rendering for Leaflet
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter sensors by selected district
  const filteredSensors = selectedDistrict
    ? sensors?.filter(s => s.districtName === selectedDistrict)
    : sensors;

  // Calculate stats
  const stats = {
    total: filteredSensors?.length || 0,
    active: filteredSensors?.filter(s => s.status === 'Active').length || 0,
    solar: filteredSensors?.filter(s => s.energySource === 'Solar').length || 0,
    grid: filteredSensors?.filter(s => s.energySource === 'Grid').length || 0,
  };

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
          <span className="text-slate-400 text-sm">Memuat peta...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="text-center">
          <div className="text-red-400 mb-2">Error memuat data sensor</div>
          <button
            onClick={() => mutate()}
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ height }}>
      <LeafletMap
        center={JAKARTA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-xl"
        style={{ background: '#0f172a' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={MAP_STYLES[mapStyle]}
        />
        
        <MapController />
        {showControls && <CustomControls />}

        {filteredSensors?.map((sensor) => (
          <SensorMarker key={sensor.sensorId} sensor={sensor} />
        ))}
      </LeafletMap>

      {/* Map Style Switcher */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-1 flex gap-1">
          {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mapStyle === style
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800/90 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="text-sm text-slate-300">Memperbarui data...</span>
        </div>
      )}

      {/* Stats bar at bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span className="text-slate-400">Total:</span>
              <span className="text-white font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-400">Aktif:</span>
              <span className="text-emerald-400 font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-slate-400">Solar:</span>
              <span className="text-amber-400 font-medium">{stats.solar}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-slate-400">Grid:</span>
              <span className="text-blue-400 font-medium">{stats.grid}</span>
            </div>
          </div>
          <button
            onClick={() => mutate()}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend */}
      {showLegend && <MapLegend />}
    </div>
  );
}
