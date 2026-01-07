'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map, BarChart3, Cpu, ArrowRight, Zap, Activity } from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import StatsCards from '@/src/components/ui/StatsCards';
import TotalEnergyChart from '@/src/components/ui/TotalEnergyChart';
import DistrictPanel from '@/src/components/ui/DistrictPanel';
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
      subtitle="Real-time monitoring untuk SDG 7 & SDG 11"
    >
      {/* Stats Cards */}
      <StatsCards />

      {/* Weather Widget */}
      <div className="mt-6">
        <WeatherWidget cityName="Jakarta" latitude={-6.2088} longitude={106.8456} />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/map"
          className="group flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Map className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Peta Sensor</p>
              <p className="text-slate-400 text-sm">Lihat distribusi sensor</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/sensors"
          className="group flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Manajemen Sensor</p>
              <p className="text-slate-400 text-sm">Kelola data sensor</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/analytics"
          className="group flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-medium">Analitik</p>
              <p className="text-slate-400 text-sm">Statistik & grafik</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-semibold">Preview Peta Sensor</h3>
              </div>
              <Link 
                href="/map"
                className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1"
              >
                Lihat Full <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="h-[350px]">
              <MapContainer />
            </div>
          </div>
        </div>

        {/* District Summary */}
        <div className="lg:col-span-1">
          <DistrictPanel />
        </div>
      </div>

      {/* Energy Chart */}
      <div className="mt-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold">Total Konsumsi Energi</h3>
            </div>
            <Link 
              href="/analytics"
              className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1"
            >
              Analitik Detail <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <TotalEnergyChart />
          </div>
        </div>
      </div>

      {/* SDG Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-white font-semibold">SDG 7: Affordable & Clean Energy</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Memastikan akses energi yang terjangkau, andal, berkelanjutan dan modern untuk semua
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold">SDG 11: Sustainable Cities</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Menjadikan kota dan pemukiman inklusif, aman, tangguh dan berkelanjutan
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
