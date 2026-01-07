'use client';

import dynamic from 'next/dynamic';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import DistrictPanelCompact from '@/src/components/ui/DistrictPanelCompact';
import SensorDetailCompact from '@/src/components/ui/SensorDetailCompact';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/src/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent"></div>
        <span className="text-slate-400 text-sm">Memuat peta...</span>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <DashboardLayout 
      title="Peta Sensor" 
      subtitle="Distribusi sensor energi di seluruh kota"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map - Takes 3 columns */}
        <div className="lg:col-span-3 h-[calc(100vh-200px)] min-h-[500px]">
          <div className="h-full rounded-xl overflow-hidden border border-slate-700/50">
            <MapContainer />
          </div>
        </div>

        {/* Right Panel - District & Sensor Detail */}
        <div className="lg:col-span-1 space-y-4">
          <DistrictPanelCompact />
          <SensorDetailCompact />
        </div>
      </div>
    </DashboardLayout>
  );
}
