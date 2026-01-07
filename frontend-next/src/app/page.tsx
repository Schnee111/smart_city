'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map, ArrowRight, Activity } from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import StatsCards from '@/src/components/ui/StatsCards';
import EnergyTrendChart from '@/src/components/ui/EnergyTrendChart';
import WeatherWidget from '@/src/components/ui/WeatherWidget';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/src/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
        <span className="text-slate-400 text-sm">Memuat peta...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <DashboardLayout 
      title="Smart City Energy Monitoring" 
      subtitle="Monitoring konsumsi energi real-time seluruh kota"
    >
      {/* Stats Cards Row */}
      <StatsCards />

      {/* Map + Weather Row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Preview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-400" />
              <h3 className="text-white font-medium text-sm">Peta Sensor</h3>
            </div>
            <Link 
              href="/map"
              className="text-emerald-400 text-xs hover:text-emerald-300 flex items-center gap-1"
            >
              Buka Full <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[350px]">
            <MapContainer showLegend={false} showControls={false} />
          </div>
        </div>

        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget cityName="Jakarta" latitude={-6.2088} longitude={106.8456} />
        </div>
      </div>

      {/* Energy Chart - Full Width */}
      <div className="mt-4 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-medium text-sm">Tren Konsumsi Energi</h3>
          </div>
          <Link 
            href="/analytics"
            className="text-emerald-400 text-xs hover:text-emerald-300 flex items-center gap-1"
          >
            Analitik Detail <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4">
          <EnergyTrendChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
