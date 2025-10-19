/**
 * GAIA PULSE API Client
 * 
 * Connects to the live AWS API Gateway endpoint to fetch environmental narratives
 * from different regions around the world.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 
  'https://yy7g8joeug.execute-api.us-east-1.amazonaws.com';

export const API_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || '10000',
  10
);

/**
 * Response type from the narrative API
 */
export interface NarrativeResponse {
  narrative: string;
  confidence: number;
  ts?: string | null;
  timestamp_utc?: string;
  region_id?: string;
  _region_id?: string;
  _bucket?: string;
  _narrative_key?: string;
  _base_key?: string;
  features?: {
    // Location
    latitude?: number | string;
    longitude?: number | string;
    
    // Sea Surface Temperature
    sea_surface_temp_celsius?: number | string;
    sea_surface_temp_fahrenheit?: number | string;
    
    // Air Temperature
    air_temp_celsius?: number | string;
    air_temp_fahrenheit?: number | string;
    
    // Additional Weather
    humidity_percent?: number | string;
    wind_speed_kmh?: number | string;
    
    // Air Quality
    pm25_air_quality?: number | string;
    ozone_air_quality?: number | string;
    no2_air_quality?: number | string;
    
    // Environmental
    precipitation_mm_per_hour?: number | string;
    solar_irradiance_watts_per_m2?: number | string;
    chlorophyll_concentration?: number | string;
    
    // Sources
    sources?: {
      marine?: string;
      air_quality?: string;
      nasa_power?: string;
      [key: string]: any;
    };
    
    // Legacy fields (backward compatibility)
    lat?: number;
    lon?: number;
    sst_c?: number;
    pm25_ug_m3?: number;
    ozone_ug_m3?: number;
    no2_ug_m3?: number;
    t2m_c?: number;
    precip_mm_hr?: number;
    solar_irradiance_wm2?: number;
    
    [key: string]: any;
  };
  events?: Array<{
    type: string;
    metric?: string;
    severity?: string;
    value?: any;
    description?: string;
  }>;
  sources?: string[];
  diary_key?: string;
}

/**
 * Fetch narrative data for a specific region
 * 
 * @param regionId - The region identifier (e.g., 'reef_sumatra', 'los_angeles')
 * @returns Promise with narrative data
 * @throws Error if the API request fails or times out
 */
export async function fetchNarrative(regionId: string): Promise<NarrativeResponse> {
  const url = `${API_BASE}/narrative?region_id=${encodeURIComponent(regionId)}`;
  
  // Set up abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `API ${response.status}: ${errorText || response.statusText}`
      );
    }
    
    const data = await response.json();
    return data;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${API_TIMEOUT}ms`);
    }
    
    throw error;
  }
}

/**
 * Available regions for selection
 */
export const AVAILABLE_REGIONS = [
  { id: 'amazon_rainforest', name: 'Amazon Rainforest', emoji: '🌳' },
  { id: 'andes_mountains', name: 'Andes Mountains', emoji: '⛰️' },
  { id: 'antarctica_coast', name: 'Antarctica Coast', emoji: '🧊' },
  { id: 'arabian_desert', name: 'Arabian Desert', emoji: '🏜️' },
  { id: 'arctic_circle', name: 'Arctic Circle', emoji: '❄️' },
  { id: 'bay_of_bengal', name: 'Bay of Bengal', emoji: '🌊' },
  { id: 'beijing', name: 'Beijing', emoji: '🏙️' },
  { id: 'borneo_rainforest', name: 'Borneo Rainforest', emoji: '🌴' },
  { id: 'reef_sumatra', name: 'Coral Reef — Sumatra', emoji: '🪸' },
  { id: 'congo_basin', name: 'Congo Basin', emoji: '🌿' },
  { id: 'delhi_india', name: 'Delhi (India)', emoji: '🏛️' },
  { id: 'gobi_desert', name: 'Gobi Desert', emoji: '🏜️' },
  { id: 'great_barrier_reef', name: 'Great Barrier Reef', emoji: '🐠' },
  { id: 'greenland_ice_sheet', name: 'Greenland Ice Sheet', emoji: '🧊' },
  { id: 'gulf_of_mexico', name: 'Gulf of Mexico', emoji: '🌊' },
  { id: 'himalayas', name: 'Himalayas', emoji: '🏔️' },
  { id: 'los_angeles', name: 'Los Angeles', emoji: '🌆' },
  { id: 'maldives_atolls', name: 'Maldives Atolls', emoji: '🏝️' },
  { id: 'new_york_city', name: 'New York City', emoji: '🗽' },
  { id: 'philippines_archipelago', name: 'Philippines Archipelago', emoji: '🏝️' },
  { id: 'sahara_desert', name: 'Sahara Desert', emoji: '🐪' },
  { id: 'tokyo_japan', name: 'Tokyo (Japan)', emoji: '🗼' },
] as const;

/**
 * Get timestamp from response (handles both ts and timestamp_utc fields)
 */
export function getTimestamp(data: NarrativeResponse): string | null | undefined {
  return data.timestamp_utc || data.ts;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return 'No timestamp available';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return 'Invalid timestamp';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return ts;
  }
}

/**
 * Get severity badge color
 */
export function getSeverityColor(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'moderate':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Format metric value - convert "data_not_found" to user-friendly dash
 */
export function formatMetricValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.toLowerCase() === 'data_not_found') return '—';
  if (typeof value === 'number' && (value === -999 || value === 999 || value <= -999.0)) return '—';
  if (typeof value === 'number') {
    // Format with appropriate decimals
    const num = Math.abs(value) < 1 ? value.toFixed(3) : value.toFixed(1);
    return num.replace(/\.?0+$/, ''); // Remove trailing zeros
  }
  return String(value);
}

/**
 * Check if value is empty/not found
 */
export function isEmptyValue(value: any): boolean {
  return value === null || 
         value === undefined || 
         value === 'data_not_found' || 
         value === -999 || 
         value === 999 ||
         value === -999.0;
}

/**
 * Format metric name to display name
 */
export function formatMetricName(key: string): string {
  // Map of special formatting cases
  const specialFormats: { [key: string]: string } = {
    'pm25_air_quality': '💨 PM2.5 Air Quality (µg/m³)',
    'ozone_air_quality': '💨 Ozone Air Quality (µg/m³)',
    'no2_air_quality': '💨 NO₂ Air Quality (µg/m³)',
    'precipitation_mm_per_hour': '🌧️ Precipitation (mm/hr)',
    'solar_irradiance_watts_per_m2': '☀️ Solar Irradiance (W/m²)',
    'chlorophyll_concentration': '🌿 Chlorophyll (mg/m³)',
    'humidity_percent': '💧 Humidity (%)',
    'wind_speed_kmh': '💨 Wind Speed (km/h)',
  };
  
  if (specialFormats[key]) {
    return specialFormats[key];
  }
  
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

