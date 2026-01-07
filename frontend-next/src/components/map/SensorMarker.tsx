'use client';

import { useEffect, useState, useRef } from 'react';
import { Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDashboardStore } from '@/src/lib/store';
import { Sensor } from '@/src/types';

interface SensorMarkerProps {
  sensor: Sensor;
}

// Create minimal, professional marker - inspired by modern dashboard maps
function createSensorIcon(energySource: string, status: string, isSelected: boolean): L.DivIcon {
  const isSolar = energySource.toLowerCase() === 'solar';
  const isActive = status.toLowerCase() === 'active';
  
  // Subtle, professional colors
  const baseColor = isSolar ? '#f59e0b' : '#3b82f6';
  const statusColor = isActive ? '#10b981' : '#ef4444';
  const opacity = isActive ? 1 : 0.7;
  const size = isSelected ? 14 : 10;
  const borderWidth = isSelected ? 3 : 2;

  return L.divIcon({
    className: 'custom-sensor-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${baseColor};
        border: ${borderWidth}px solid ${isSelected ? '#fff' : statusColor};
        opacity: ${opacity};
        box-shadow: 0 0 ${isSelected ? '12px' : '6px'} ${baseColor}${isSelected ? '80' : '40'};
        transition: all 0.2s ease;
        cursor: pointer;
        ${isSelected ? 'transform: scale(1.2);' : ''}
      "></div>
    `,
    iconSize: [size + borderWidth * 2, size + borderWidth * 2],
    iconAnchor: [(size + borderWidth * 2) / 2, (size + borderWidth * 2) / 2],
  });
}

export default function SensorMarker({ sensor }: SensorMarkerProps) {
  const map = useMap();
  const { setSelectedSensor, selectedSensor } = useDashboardStore();
  const [icon, setIcon] = useState<L.DivIcon | null>(null);
  const markerRef = useRef<L.Marker>(null);

  const isSelected = selectedSensor?.sensorId === sensor.sensorId;
  const isSolar = sensor.energySource.toLowerCase() === 'solar';
  const isActive = sensor.status.toLowerCase() === 'active';

  useEffect(() => {
    setIcon(createSensorIcon(sensor.energySource, sensor.status, isSelected));
  }, [sensor.energySource, sensor.status, isSelected]);

  const handleClick = () => {
    setSelectedSensor(sensor);
    
    // Calculate offset to show marker in lower portion of viewport
    // This prevents any overlay from being cut off at the top
    const mapSize = map.getSize();
    const targetPoint = map.project([sensor.latitude, sensor.longitude], 14);
    // Offset marker to be in lower 60% of screen (move view up by 20% of screen height)
    const offsetPoint = L.point(targetPoint.x, targetPoint.y - mapSize.y * 0.15);
    const targetLatLng = map.unproject(offsetPoint, 14);
    
    map.flyTo(targetLatLng, 14, { 
      duration: 0.8,
      easeLinearity: 0.5
    });
  };

  if (!icon) return null;

  return (
    <>
      {/* Subtle selection ring - replaces radar animation */}
      {isSelected && (
        <CircleMarker
          center={[sensor.latitude, sensor.longitude]}
          radius={25}
          pathOptions={{
            color: isSolar ? '#f59e0b' : '#3b82f6',
            fillColor: isSolar ? '#f59e0b' : '#3b82f6',
            fillOpacity: 0.08,
            weight: 1,
            opacity: 0.4,
          }}
        />
      )}

      <Marker
        ref={markerRef}
        position={[sensor.latitude, sensor.longitude]}
        icon={icon}
        eventHandlers={{
          click: handleClick,
        }}
      >
        {/* Clean tooltip on hover - replaces large popup */}
        <Tooltip 
          direction="top" 
          offset={[0, -10]} 
          opacity={1}
          className="sensor-tooltip-minimal"
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 shadow-xl -mx-3 -my-2">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: isSolar ? '#f59e0b' : '#3b82f6' }}
              />
              <span className="text-white text-sm font-medium">{sensor.districtName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isActive ? 'Active' : 'Offline'}
              </span>
            </div>
            {sensor.latestReading && (
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{sensor.latestReading.kwhUsage.toFixed(2)} kWh</span>
                <span>•</span>
                <span>{sensor.latestReading.voltage.toFixed(1)} V</span>
              </div>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}
