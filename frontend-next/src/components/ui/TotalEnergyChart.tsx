'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { TrendingUp, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetcher } from '@/src/lib/fetcher';

interface Sensor {
  sensorId: string;
  districtName: string;
  energySource: string;
  latestReading?: {
    kwhUsage: number;
    voltage: number;
    recordedAt: string;
  };
}

interface HistoryPoint {
  time: string;
  timestamp: number;
  totalKwh: number;
  sensorCount: number;
  avgVoltage: number;
}

export default function TotalEnergyChart() {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  
  // Fetch all sensors with latest readings
  const { data: sensors = [] } = useSWR<Sensor[]>(
    '/sensors',
    fetcher,
    { refreshInterval: 3000 }
  );

  // Calculate totals and build history
  useEffect(() => {
    if (sensors.length === 0) return;

    const now = new Date();
    const timestamp = now.getTime();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Calculate current totals
    let totalKwh = 0;
    let totalVoltage = 0;
    let activeCount = 0;

    sensors.forEach(sensor => {
      if (sensor.latestReading) {
        totalKwh += sensor.latestReading.kwhUsage || 0;
        totalVoltage += sensor.latestReading.voltage || 0;
        activeCount++;
      }
    });

    const avgVoltage = activeCount > 0 ? totalVoltage / activeCount : 0;

    // Add to history (keep last 30 points)
    setHistory(prev => {
      const newPoint: HistoryPoint = {
        time: timeStr,
        timestamp,
        totalKwh: Math.round(totalKwh * 100) / 100,
        sensorCount: activeCount,
        avgVoltage: Math.round(avgVoltage),
      };

      // Avoid duplicate timestamps
      if (prev.length > 0 && prev[prev.length - 1].timestamp === timestamp) {
        return prev;
      }

      const updated = [...prev, newPoint];
      return updated.slice(-30); // Keep last 30 data points
    });
  }, [sensors]);

  // Current stats
  const currentStats = useMemo(() => {
    let totalKwh = 0;
    let solarKwh = 0;
    let gridKwh = 0;
    let activeCount = 0;

    sensors.forEach(sensor => {
      if (sensor.latestReading) {
        const kwh = sensor.latestReading.kwhUsage || 0;
        totalKwh += kwh;
        if (sensor.energySource === 'Solar') {
          solarKwh += kwh;
        } else {
          gridKwh += kwh;
        }
        activeCount++;
      }
    });

    return { totalKwh, solarKwh, gridKwh, activeCount };
  }, [sensors]);

  // Data for source breakdown bar
  const sourceData = [
    { name: 'Solar', value: currentStats.solarKwh, fill: '#f59e0b' },
    { name: 'Grid', value: currentStats.gridKwh, fill: '#6366f1' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-xs text-slate-400">Total Saat Ini</p>
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
            {currentStats.activeCount} sensor aktif
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Total kWh</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotalKwh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Total']}
            />
            <Area
              type="monotone"
              dataKey="totalKwh"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotalKwh)"
              name="Total kWh"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 text-center">
        Data agregat dari semua sensor • Diperbarui setiap 3 detik
      </p>
    </div>
  );
}
