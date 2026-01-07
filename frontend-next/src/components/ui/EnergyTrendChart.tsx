'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Calendar, ChevronLeft, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetcher } from '@/src/lib/fetcher';

interface HourlyData {
  hour: number;
  timeLabel: string;
  totalKwh: number;
  solarKwh: number;
  gridKwh: number;
  readingCount: number;
}

interface LiveDataPoint {
  time: string;
  totalKwh: number;
  solarKwh: number;
  gridKwh: number;
}

interface Sensor {
  sensorId: string;
  energySource: string;
  latestReading?: {
    kwhUsage: number;
  };
}

type ViewMode = 'live' | 'today' | 'history';

export default function EnergyTrendChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [liveHistory, setLiveHistory] = useState<LiveDataPoint[]>([]);

  // Fetch hourly historical data
  const { data: hourlyData, isLoading: isLoadingHourly, mutate: mutateHourly } = useSWR<HourlyData[]>(
    viewMode !== 'live' ? `/stats/hourly?date=${selectedDate}` : null,
    fetcher
  );

  // Fetch live sensor data
  const { data: sensors = [] } = useSWR<Sensor[]>(
    viewMode === 'live' ? '/sensors' : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // Build live history from sensor data
  useEffect(() => {
    if (viewMode !== 'live' || sensors.length === 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    let totalKwh = 0;
    let solarKwh = 0;
    let gridKwh = 0;

    sensors.forEach(sensor => {
      if (sensor.latestReading) {
        const kwh = sensor.latestReading.kwhUsage || 0;
        totalKwh += kwh;
        if (sensor.energySource === 'Solar') {
          solarKwh += kwh;
        } else {
          gridKwh += kwh;
        }
      }
    });

    setLiveHistory(prev => {
      const newPoint: LiveDataPoint = {
        time: timeStr,
        totalKwh: Math.round(totalKwh * 100) / 100,
        solarKwh: Math.round(solarKwh * 100) / 100,
        gridKwh: Math.round(gridKwh * 100) / 100,
      };

      // Prevent duplicate entries
      if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
        return prev;
      }

      return [...prev, newPoint].slice(-60); // Keep last 60 points (3 minutes)
    });
  }, [sensors, viewMode]);

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    
    // Don't go beyond today
    if (date > new Date()) return;
    
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Hari Ini';
    if (dateStr === yesterday) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Prepare chart data
  const chartData = viewMode === 'live' 
    ? liveHistory 
    : (hourlyData || []).map(d => ({
        time: d.timeLabel,
        totalKwh: d.totalKwh,
        solarKwh: d.solarKwh,
        gridKwh: d.gridKwh,
      }));

  // Current totals for stats row
  const currentStats = viewMode === 'live'
    ? liveHistory[liveHistory.length - 1] || { totalKwh: 0, solarKwh: 0, gridKwh: 0 }
    : (hourlyData || []).reduce((acc, d) => ({
        totalKwh: acc.totalKwh + d.totalKwh,
        solarKwh: acc.solarKwh + d.solarKwh,
        gridKwh: acc.gridKwh + d.gridKwh,
      }), { totalKwh: 0, solarKwh: 0, gridKwh: 0 });

  return (
    <div className="space-y-4">
      {/* Header with View Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('live')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'live'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'live' ? 'bg-white animate-pulse' : 'bg-emerald-400'}`}></span>
              Live
            </span>
          </button>
          <button
            onClick={() => {
              setViewMode('today');
              setSelectedDate(new Date().toISOString().split('T')[0]);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'today' && isToday
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => {
              setViewMode('history');
              // Set to yesterday by default for history
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              setSelectedDate(yesterday);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'history' || (viewMode === 'today' && !isToday)
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Historis
          </button>
        </div>

        {/* Date Navigator (only for historical view) */}
        {viewMode !== 'live' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white font-medium">{formatDate(selectedDate)}</span>
            </div>

            <button
              onClick={() => navigateDate('next')}
              disabled={isToday}
              className={`p-1.5 rounded-lg bg-slate-800/50 transition-colors ${
                isToday 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => mutateHourly()}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHourly ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            {viewMode === 'live' ? 'Total Saat Ini' : 'Total Hari Ini'}
          </p>
          <p className="text-xl font-bold text-white">
            {currentStats.totalKwh.toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-xs text-slate-400">Solar</p>
          <p className="text-xl font-bold text-amber-400">
            {currentStats.solarKwh.toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-xs text-slate-400">Grid</p>
          <p className="text-xl font-bold text-indigo-400">
            {currentStats.gridKwh.toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">
            {viewMode === 'live' 
              ? `Update setiap 3 detik • ${liveHistory.length} data points` 
              : `Data per jam • ${chartData.length} jam`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-slate-400">Solar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-slate-400">Grid</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        {isLoadingHourly ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            {viewMode === 'live' ? 'Menunggu data...' : 'Tidak ada data untuk tanggal ini'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    totalKwh: 'Total',
                    solarKwh: 'Solar',
                    gridKwh: 'Grid',
                  };
                  return [`${value.toFixed(2)} kWh`, labels[name] || name];
                }}
              />
              <Area
                type="monotone"
                dataKey="totalKwh"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorTotal)"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
              />
              <Area
                type="monotone"
                dataKey="solarKwh"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#colorSolar)"
                dot={false}
                activeDot={{ r: 3, fill: '#f59e0b' }}
              />
              <Area
                type="monotone"
                dataKey="gridKwh"
                stroke="#6366f1"
                strokeWidth={1.5}
                fill="url(#colorGrid)"
                dot={false}
                activeDot={{ r: 3, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer info */}
      <p className="text-xs text-slate-500 text-center">
        {viewMode === 'live' 
          ? 'Data agregat real-time dari semua sensor aktif' 
          : `Data historis untuk ${formatDate(selectedDate)}`}
      </p>
    </div>
  );
}
