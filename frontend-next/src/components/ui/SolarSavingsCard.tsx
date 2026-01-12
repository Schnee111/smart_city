'use client';
import useSWR from 'swr';
import { Coins, Banknote } from 'lucide-react'; 

type ApiResponse<T> = { success: boolean; message?: string; data: T | null };
const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ApiResponse<number>>);

function formatIDR(value: number) {
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function SolarSavingsCard() {
  const { data, error, isLoading } = useSWR<ApiResponse<number>>('/api/v1/analytics/solar-savings', fetcher, {
    refreshInterval: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-slate-400">
        Menghitung penghematan energi surya...
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-slate-400">
        Data penghematan belum tersedia
      </div>
    );
  }

  const savings = Number(data.data ?? 0);

  if (savings === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Coins className="w-6 h-6 text-amber-400" /> 
          </div>
          <div>
            <div className="text-xs text-slate-400">Penghematan hari ini</div>
            <div className="text-white font-semibold">Rp 0</div>
            <div className="text-xs text-slate-400 mt-1">Belum ada penghematan energi surya hari ini</div>
          </div>
        </div>
        <a href="/analytics" className="text-emerald-400 text-xs hover:underline">Lihat detail</a>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Banknote className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Penghematan hari ini</div>
          <p className="text-white font-semibold">{formatIDR(savings)}</p>
          <div className="text-xs text-slate-400 mt-1">Berhasil dihemat berkat energi surya</div>
        </div>
      </div>
      <a href="/analytics" className="text-emerald-400 text-xs hover:underline">Lihat detail</a>
    </div>
  );
}
