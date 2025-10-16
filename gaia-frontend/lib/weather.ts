/**
 * Live Weather Data Integration
 * Uses Open-Meteo API (free, no API key required)
 */

interface WeatherData {
  air_temp_celsius: number;
  air_temp_fahrenheit: number;
  precipitation_mm_per_hour: number;
  humidity_percent: number;
  wind_speed_kmh: number;
}

// Coordinates for each region
const REGION_COORDS: { [key: string]: { lat: number; lon: number } } = {
  'amazon_rainforest': { lat: -3.4, lon: -62.0 },
  'andes_mountains': { lat: -13.16, lon: -72.54 },
  'antarctica_coast': { lat: -70.0, lon: 0.0 },
  'arabian_desert': { lat: 23.42, lon: 45.08 },
  'arctic_circle': { lat: 66.5, lon: 0 },
  'bay_of_bengal': { lat: 15.0, lon: 88.0 },
  'beijing': { lat: 39.9, lon: 116.4 },
  'borneo_rainforest': { lat: 0.5, lon: 114.0 },
  'reef_sumatra': { lat: -0.5, lon: 100.0 },
  'congo_basin': { lat: -0.5, lon: 22.0 },
  'delhi_india': { lat: 28.6, lon: 77.2 },
  'gobi_desert': { lat: 42.5, lon: 103.5 },
  'great_barrier_reef': { lat: -18.28, lon: 147.69 },
  'greenland_ice_sheet': { lat: 72.0, lon: -40.0 },
  'gulf_of_mexico': { lat: 25.0, lon: -90.0 },
  'himalayas': { lat: 28.0, lon: 84.0 },
  'los_angeles': { lat: 34.05, lon: -118.24 },
  'maldives_atolls': { lat: 3.2, lon: 73.0 },
  'new_york_city': { lat: 40.71, lon: -74.0 },
  'philippines_archipelago': { lat: 12.88, lon: 121.77 },
  'sahara_desert': { lat: 23.8, lon: 0 },
  'tokyo_japan': { lat: 35.68, lon: 139.65 },
};

/**
 * Fetch live weather data from Open-Meteo
 */
export async function fetchLiveWeather(regionId: string): Promise<WeatherData | null> {
  try {
    const coords = REGION_COORDS[regionId];
    if (!coords) {
      console.warn(`No coordinates for region: ${regionId}`);
      return null;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Convert Celsius to Fahrenheit
    const celsius = current.temperature_2m || 0;
    const fahrenheit = (celsius * 9/5) + 32;

    return {
      air_temp_celsius: parseFloat(celsius.toFixed(1)),
      air_temp_fahrenheit: parseFloat(fahrenheit.toFixed(1)),
      precipitation_mm_per_hour: current.precipitation || 0,
      humidity_percent: current.relative_humidity_2m || 0,
      wind_speed_kmh: current.wind_speed_10m || 0,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

