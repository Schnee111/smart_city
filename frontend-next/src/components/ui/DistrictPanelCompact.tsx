'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Building2, Home, Factory, MapPin, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { fetcher } from '@/src/lib/fetcher';
import { useDashboardStore } from '@/src/lib/store';
import { DistrictProfile } from '@/src/types';

export default function DistrictPanel() {
  const { selectedDistrict, setSelectedDistrict } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: districts, isLoading } = useSWR<DistrictProfile[]>(
    '/api/v1/stats/districts',
    fetcher
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'industrial':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'residential':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'commercial':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'industrial':
        return <Factory className="w-3.5 h-3.5" />;
      case 'residential':
        return <Home className="w-3.5 h-3.5" />;
      case 'commercial':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const selectedDistrictData = districts?.find(d => d.districtName === selectedDistrict);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
      {/* Header with current selection */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            {selectedDistrict ? getCategoryIcon(selectedDistrictData?.category || '') : <Globe className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="text-left">
            <p className="text-white font-medium text-sm">
              {selectedDistrict || 'Semua Distrik'}
            </p>
            <p className="text-slate-500 text-xs">
              {selectedDistrict 
                ? selectedDistrictData?.category 
                : `${districts?.length || 0} distrik`}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable district list */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-2 pt-0 space-y-1">
          {/* All Districts Option */}
          <button
            onClick={() => {
              setSelectedDistrict(null);
              setIsExpanded(false);
            }}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
              selectedDistrict === null
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Semua Distrik
          </button>

          {isLoading ? (
            <div className="h-8 bg-slate-700/30 rounded-lg animate-pulse" />
          ) : (
            districts?.map((district) => (
              <button
                key={district.districtName}
                onClick={() => {
                  setSelectedDistrict(district.districtName);
                  setIsExpanded(false);
                }}
                className={`w-full px-3 py-2 rounded-lg flex items-center justify-between transition-all text-sm ${
                  selectedDistrict === district.districtName
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(district.category)}
                  <span>{district.districtName}</span>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getCategoryColor(district.category)}`}>
                  {district.category.slice(0, 3)}
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
