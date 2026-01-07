'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Sun, Zap, Activity, Gauge, Navigation } from 'lucide-react';
import { useDashboardStore } from '@/src/lib/store';
import { formatKwh, formatVoltage, formatRelativeTime } from '@/src/lib/formatters';

export default function SensorDetailCompact() {
  const { selectedSensor, setSelectedSensor } = useDashboardStore();

  if (!selectedSensor) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-sm">Klik marker pada peta untuk melihat detail sensor</p>
        </div>
      </div>
    );
  }

  const isSolar = selectedSensor.energySource.toLowerCase() === 'solar';
  const isActive = selectedSensor.status.toLowerCase() === 'active';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedSensor.sensorId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-white font-medium text-sm truncate">
              {selectedSensor.sensorId.slice(0, 20)}...
            </span>
          </div>
          <button
            onClick={() => setSelectedSensor(null)}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-slate-700/50">
          {/* Energy Source */}
          <div className="p-2 text-center">
            <div className="flex items-center justify-center gap-1">
              {isSolar ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className={`text-xs font-medium ${isSolar ? 'text-amber-400' : 'text-blue-400'}`}>
                {selectedSensor.energySource}
              </span>
            </div>
          </div>
          
          {/* Status */}
          <div className="p-2 text-center">
            <span className={`text-xs font-medium ${
              isActive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {selectedSensor.status}
            </span>
          </div>
          
          {/* Location */}
          <div className="p-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-300 truncate">
                {selectedSensor.districtName.split(' ')[1] || selectedSensor.districtName}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Reading */}
        {selectedSensor.latestReading && (
          <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-transparent border-t border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-slate-500 text-xs">kWh</p>
                  <p className="text-white font-bold text-lg">
                    {formatKwh(selectedSensor.latestReading.kwhUsage)}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div>
                  <p className="text-slate-500 text-xs">Voltage</p>
                  <p className="text-white font-bold text-lg">
                    {formatVoltage(selectedSensor.latestReading.voltage)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Gauge className="w-4 h-4 text-emerald-400 inline-block mb-1" />
                <p className="text-slate-500 text-xs">
                  {formatRelativeTime(selectedSensor.latestReading.recordedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
