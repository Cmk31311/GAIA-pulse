"use client";

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

type Category = 'forest' | 'ocean' | 'desert' | 'mountain' | 'city' | 'ice' | 'reef';

interface RegionCoordinates {
  lat: number;
  lon: number;
  name: string;
  id: string;
  emoji: string;
  category: Category;
}

interface EarthGlobeProps {
  selectedRegion: string;
  onRegionClick: (regionId: string) => void;
}

interface CategoryConfig {
  color: string;
  bgColor: string;
  textColor: string;
  emoji: string;
  label: string;
}

const REGION_COORDINATES: RegionCoordinates[] = [
  { id: 'amazon_rainforest', name: 'Amazon Rainforest', lat: -3.4, lon: -62.0, emoji: '🌳', category: 'forest' },
  { id: 'andes_mountains', name: 'Andes Mountains', lat: -13.16, lon: -72.54, emoji: '⛰️', category: 'mountain' },
  { id: 'antarctica_coast', name: 'Antarctica Coast', lat: -70.0, lon: 0.0, emoji: '🧊', category: 'ice' },
  { id: 'arabian_desert', name: 'Arabian Desert', lat: 23.42, lon: 45.08, emoji: '🏜️', category: 'desert' },
  { id: 'arctic_circle', name: 'Arctic Circle', lat: 66.5, lon: 0, emoji: '❄️', category: 'ice' },
  { id: 'bay_of_bengal', name: 'Bay of Bengal', lat: 15.0, lon: 88.0, emoji: '🌊', category: 'ocean' },
  { id: 'beijing', name: 'Beijing', lat: 39.9, lon: 116.4, emoji: '🏙️', category: 'city' },
  { id: 'borneo_rainforest', name: 'Borneo Rainforest', lat: 0.5, lon: 114.0, emoji: '🌴', category: 'forest' },
  { id: 'reef_sumatra', name: 'Coral Reef — Sumatra', lat: -0.5, lon: 100.0, emoji: '🪸', category: 'reef' },
  { id: 'congo_basin', name: 'Congo Basin', lat: -0.5, lon: 22.0, emoji: '🌿', category: 'forest' },
  { id: 'delhi_india', name: 'Delhi (India)', lat: 28.6, lon: 77.2, emoji: '🏛️', category: 'city' },
  { id: 'gobi_desert', name: 'Gobi Desert', lat: 42.5, lon: 103.5, emoji: '🏜️', category: 'desert' },
  { id: 'great_barrier_reef', name: 'Great Barrier Reef', lat: -18.28, lon: 147.69, emoji: '🐠', category: 'reef' },
  { id: 'greenland_ice_sheet', name: 'Greenland Ice Sheet', lat: 72.0, lon: -40.0, emoji: '🧊', category: 'ice' },
  { id: 'gulf_of_mexico', name: 'Gulf of Mexico', lat: 25.0, lon: -90.0, emoji: '🌊', category: 'ocean' },
  { id: 'himalayas', name: 'Himalayas', lat: 28.0, lon: 84.0, emoji: '🏔️', category: 'mountain' },
  { id: 'los_angeles', name: 'Los Angeles', lat: 34.05, lon: -118.24, emoji: '🌆', category: 'city' },
  { id: 'maldives_atolls', name: 'Maldives Atolls', lat: 3.2, lon: 73.0, emoji: '🏝️', category: 'reef' },
  { id: 'new_york_city', name: 'New York City', lat: 40.71, lon: -74.0, emoji: '🗽', category: 'city' },
  { id: 'philippines_archipelago', name: 'Philippines Archipelago', lat: 12.88, lon: 121.77, emoji: '🏝️', category: 'ocean' },
  { id: 'sahara_desert', name: 'Sahara Desert', lat: 23.8, lon: 0, emoji: '🐪', category: 'desert' },
  { id: 'tokyo_japan', name: 'Tokyo (Japan)', lat: 35.68, lon: 139.65, emoji: '🗼', category: 'city' },
];

// Enhanced category configuration with visual styling
const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  forest: { 
    color: '#00ffaa', // Bright emerald green
    bgColor: 'bg-green-500/20', 
    textColor: 'text-green-300',
    emoji: '🌳',
    label: 'Forest'
  },
  ocean: { 
    color: '#00d9ff', // Vibrant cyan
    bgColor: 'bg-blue-500/20', 
    textColor: 'text-blue-300',
    emoji: '🌊',
    label: 'Ocean'
  },
  desert: { 
    color: '#ffbb33', // Warm golden orange
    bgColor: 'bg-orange-500/20', 
    textColor: 'text-orange-300',
    emoji: '🏜️',
    label: 'Desert'
  },
  mountain: { 
    color: '#d4a574', // Light sandy brown
    bgColor: 'bg-amber-700/20', 
    textColor: 'text-amber-300',
    emoji: '⛰️',
    label: 'Mountain'
  },
  city: { 
    color: '#ff5757', // Bright neon red
    bgColor: 'bg-red-500/20', 
    textColor: 'text-red-300',
    emoji: '🏙️',
    label: 'City'
  },
  ice: { 
    color: '#b3f0ff', // Bright ice blue
    bgColor: 'bg-cyan-400/20', 
    textColor: 'text-cyan-200',
    emoji: '❄️',
    label: 'Ice'
  },
  reef: { 
    color: '#ff66cc', // Vibrant pink
    bgColor: 'bg-purple-500/20', 
    textColor: 'text-purple-300',
    emoji: '🪸',
    label: 'Reef'
  }
};

const getCategoryColor = (category: Category): string => {
  return CATEGORY_CONFIG[category].color;
};

export default function EarthGlobe({ selectedRegion, onRegionClick }: EarthGlobeProps) {
  const globeEl = useRef<any>(null);

  // Rotate globe to selected region
  useEffect(() => {
    if (globeEl.current) {
      const region = REGION_COORDINATES.find(r => r.id === selectedRegion);
      if (region) {
        globeEl.current.pointOfView(
          { lat: region.lat, lng: region.lon, altitude: 2 },
          1000
        );
      }
    }
  }, [selectedRegion]);

  // Auto-rotate globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Markers for regions
        labelsData={REGION_COORDINATES}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lon}
        labelText={(d: any) => d.name}
        labelSize={1.3}
        labelDotRadius={0.7}
        labelColor={(d: any) => d.id === 'greenland_ice_sheet' ? '#00ff00' : '#ffffff'}
        labelResolution={2}
        
        // Points for regions
        pointsData={REGION_COORDINATES}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lon}
        pointColor={(d: any) => getCategoryColor(d.category)}
        pointAltitude={0.01}
        pointRadius={0.5}
        
        // Click handler
        onLabelClick={(label: any) => {
          onRegionClick(label.id);
        }}
        onPointClick={(point: any) => {
          onRegionClick(point.id);
        }}
        
        // Settings
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.25}
      />
      
      {/* Legend with all categories */}
      <div className="absolute top-4 left-4 bg-black/90 text-white px-4 py-3 rounded-xl backdrop-blur-md border border-gray-700 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">🌍</div>
          <p className="text-sm font-bold font-orbitron tracking-wide">Interactive Earth</p>
        </div>
        <p className="text-xs opacity-80 mb-3">
          {REGION_COORDINATES.length} regions • Click to explore
        </p>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const count = REGION_COORDINATES.filter(r => r.category === category).length;
            return (
              <span
                key={category}
                className={`px-2.5 py-1.5 ${config.bgColor} ${config.textColor} text-xs rounded-md font-medium border border-gray-700/50 flex items-center gap-2`}
                title={`${count} ${config.label} region${count !== 1 ? 's' : ''}`}
              >
                <span className="text-sm">{config.emoji}</span>
                <span className="flex-1">{config.label}</span>
                <span className="opacity-70 text-xs">({count})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

