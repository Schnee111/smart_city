'use client';

import { useState } from 'react';
import { 
  Settings, 
  Server, 
  Map, 
  Bell, 
  Info, 
  ExternalLink,
  Check,
  Database,
  Globe,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import { Select } from '@/src/components/ui/Select';
import { API_BASE_URL } from '@/src/lib/api';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [refreshInterval, setRefreshInterval] = useState('5000');
  const [mapStyle, setMapStyle] = useState('dark');
  const [showNotifications, setShowNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to localStorage or backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout 
      title="Pengaturan" 
      subtitle="Konfigurasi aplikasi dan preferensi"
    >
      <div className="max-w-4xl space-y-6">
        {/* API Configuration */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-700/50">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Konfigurasi API</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Backend API URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="http://localhost:8080/api/v1"
                />
                <button className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                  Test
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">URL endpoint untuk koneksi ke backend Spring Boot</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Refresh Interval (ms)</label>
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                options={[
                  { value: '1000', label: '1 detik' },
                  { value: '3000', label: '3 detik' },
                  { value: '5000', label: '5 detik' },
                  { value: '10000', label: '10 detik' },
                  { value: '30000', label: '30 detik' }
                ]}
              />
              <p className="text-xs text-slate-500 mt-1">Interval polling data real-time dari server</p>
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-700/50">
            <Map className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Pengaturan Peta</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Style Peta Default</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark', icon: '🌙' },
                  { id: 'satellite', label: 'Satellite', icon: '🛰️' },
                  { id: 'street', label: 'Street', icon: '🗺️' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setMapStyle(style.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      mapStyle === style.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{style.icon}</span>
                    <p className="text-sm mt-1">{style.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-white text-sm">Auto-center pada sensor aktif</p>
                  <p className="text-xs text-slate-500">Peta otomatis fokus ke sensor yang dipilih</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-700/50">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Notifikasi</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-white text-sm">Peringatan konsumsi tinggi</p>
                <p className="text-xs text-slate-500">Notifikasi saat sensor melebihi threshold</p>
              </div>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  showNotifications ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  showNotifications ? 'right-1' : 'left-1'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-white text-sm">Sensor offline alert</p>
                <p className="text-xs text-slate-500">Notifikasi saat sensor tidak aktif</p>
              </div>
              <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-700/50">
            <Info className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Informasi Sistem</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-wide">Aplikasi</p>
                <p className="text-white font-medium mt-1">SCEM v1.0.0</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-wide">Frontend</p>
                <p className="text-white font-medium mt-1">Next.js 14</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-wide">Backend</p>
                <p className="text-white font-medium mt-1">Spring Boot 3</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs uppercase tracking-wide">Database</p>
                <p className="text-white font-medium mt-1">Apache Cassandra</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Smart City Energy Monitoring (SCEM)</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Proyek mata kuliah NoSQL - Implementasi monitoring energi real-time 
                    menggunakan Apache Cassandra untuk mendukung SDG 7 (Affordable & Clean Energy) 
                    dan SDG 11 (Sustainable Cities).
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <a 
                      href="https://cassandra.apache.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1"
                    >
                      Cassandra Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://sdgs.un.org/goals"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1"
                    >
                      SDGs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors">
            Reset ke Default
          </button>
          <button 
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
              saved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Tersimpan
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
