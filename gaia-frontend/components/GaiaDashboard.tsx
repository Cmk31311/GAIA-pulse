"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import {
  fetchNarrative,
  AVAILABLE_REGIONS,
  formatTimestamp,
  getSeverityColor,
  formatMetricValue,
  formatMetricName,
  isEmptyValue,
  type NarrativeResponse,
} from "@/lib/api";
import { fetchLiveWeather } from "@/lib/weather";

const EarthGlobe = dynamic(() => import('./EarthGlobe'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg flex items-center justify-center">
      <p className="text-white">Loading Earth Globe...</p>
    </div>
  )
});

export default function GaiaDashboard() {
  const [region, setRegion] = useState(AVAILABLE_REGIONS[0].id);
  const [data, setData] = useState<NarrativeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(false);

  const loadData = async (regionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both AWS narrative AND live weather data in parallel
      const [narrativeResult, weatherData] = await Promise.all([
        fetchNarrative(regionId),
        fetchLiveWeather(regionId)
      ]);
      
      // Merge weather data into features if available
      if (weatherData && narrativeResult.features) {
        narrativeResult.features = {
          ...narrativeResult.features,
          // Override with live weather data
          air_temp_celsius: weatherData.air_temp_celsius,
          air_temp_fahrenheit: weatherData.air_temp_fahrenheit,
          precipitation_mm_per_hour: weatherData.precipitation_mm_per_hour,
          humidity_percent: weatherData.humidity_percent,
          wind_speed_kmh: weatherData.wind_speed_kmh,
        };
      } else if (weatherData && !narrativeResult.features) {
        narrativeResult.features = {
          air_temp_celsius: weatherData.air_temp_celsius,
          air_temp_fahrenheit: weatherData.air_temp_fahrenheit,
          precipitation_mm_per_hour: weatherData.precipitation_mm_per_hour,
          humidity_percent: weatherData.humidity_percent,
          wind_speed_kmh: weatherData.wind_speed_kmh,
        };
      }
      
      setData(narrativeResult);
    } catch (err: any) {
      // Handle 404 as "No narrative yet"
      if (err.message?.includes('404')) {
        setError('No narrative yet for this region. Try another region or refresh later.');
      } else {
      setError(err.message || 'Failed to fetch narrative');
      }
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(region);
    
    // Auto-refresh every 60 seconds to get live weather updates
    const interval = setInterval(() => {
      loadData(region);
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [region]);

  const selectedRegion = AVAILABLE_REGIONS.find(r => r.id === region);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-emerald-950 py-8 px-4 relative overflow-hidden">
      {/* Animated background accents - Earth elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <div className="inline-block">
            <h1 className="text-7xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 drop-shadow-2xl font-orbitron">
              GAIA PULSE
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg font-light tracking-widest text-sky-300 font-orbitron">
              <span className="inline-block w-12 h-px bg-gradient-to-r from-transparent via-sky-400 to-teal-400"></span>
              <span>THE PLANET WRITES BACK</span>
              <span className="inline-block w-12 h-px bg-gradient-to-l from-transparent via-teal-400 to-emerald-400"></span>
            </div>
          </div>
        </div>

        {/* Interactive Earth Globe */}
        <div className="mb-6">
          <EarthGlobe 
            selectedRegion={region} 
            onRegionClick={(regionId) => setRegion(regionId)}
          />
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="region-select" className="block text-sm font-semibold text-cyan-200 mb-3 tracking-wide uppercase">
                Select Region
              </label>
              <select
                id="region-select"
                className="w-full bg-white/90 border-2 border-purple-300/50 rounded-xl p-3 text-lg font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all shadow-lg"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={loading}
              >
                {AVAILABLE_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.emoji} {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadData(region)}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gradient-to-br from-white via-purple-50 to-cyan-50 rounded-2xl shadow-2xl p-12 text-center border border-purple-200/30">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gradient-to-r from-purple-200 to-cyan-200 rounded-full w-3/4 mx-auto"></div>
              <div className="h-6 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full w-1/2 mx-auto"></div>
            </div>
            <p className="text-purple-700 font-semibold mt-6 text-lg">
              Fetching latest narrative from AWS...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400/50 rounded-2xl shadow-2xl p-8">
            <div className="flex items-start">
              <span className="text-4xl mr-4 drop-shadow-lg">⚠️</span>
              <div>
                <h3 className="text-red-800 font-bold text-xl mb-2">Error Loading Data</h3>
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button
                  onClick={() => loadData(region)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Display */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Narrative Card */}
            <div className="bg-gradient-to-br from-white via-purple-50 to-cyan-50 rounded-2xl shadow-2xl p-8 border border-purple-200/30">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl drop-shadow-lg">{selectedRegion?.emoji}</span>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-cyan-600">
                    {(data.region_id || data._region_id || region)?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Region'}
                  </h2>
                </div>
                {data.confidence !== null && data.confidence !== undefined && (
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-2 rounded-full font-bold shadow-lg">
                    {(data.confidence * 100).toFixed(0)}% Confidence
                </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 rounded-xl opacity-20 blur"></div>
                <div className="relative bg-white p-8 rounded-xl shadow-inner">
                  {/* Narrative Title */}
                  <div className="mb-6 pb-4 border-b-2 border-gradient-to-r from-purple-200 to-cyan-200">
                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
                      🌍 Voice of Earth
                    </h4>
                    <p className="text-xs text-gray-500">AI-generated environmental narrative</p>
                  </div>
                  
                  {/* Narrative Content */}
                  <div className="space-y-6">
                    {(() => {
                      const paragraphs = (data.narrative || 'No narrative available.').split('\n\n').filter(p => p.trim());
                      const sections: { title: string; icon: string; paragraphs: string[] }[] = [];
                      let currentSection: { title: string; icon: string; paragraphs: string[] } | null = null;
                      
                      paragraphs.forEach((paragraph, idx) => {
                        const lower = paragraph.toLowerCase();
                        
                        // Detect section type based on content
                        let title = '';
                        let icon = '';
                        
                        if (idx === 0) {
                          title = 'Current State';
                          icon = '📍';
                        } else if (lower.includes('what can help') || lower.includes('what could help')) {
                          title = 'What Can Help';
                          icon = '💡';
                        } else if (lower.includes('how to mitigate') || lower.includes('mitigation')) {
                          title = 'How To Mitigate';
                          icon = '🛡️';
                        } else if (lower.includes('what humans') || lower.includes('people could') || lower.includes('we should')) {
                          title = 'Actions We Can Take';
                          icon = '👥';
                        } else if (lower.includes('because') || lower.includes('due to') || lower.includes('caused by')) {
                          title = 'Why This Matters';
                          icon = '🔍';
                        } else if (lower.includes('impact') || lower.includes('consequence') || lower.includes('effect')) {
                          title = 'Environmental Impact';
                          icon = '⚠️';
                        } else if (lower.includes('future') || lower.includes('will') || lower.includes('expect')) {
                          title = 'Looking Ahead';
                          icon = '🔮';
                        } else if (lower.includes('data shows') || lower.includes('reading') || lower.includes('measure')) {
                          title = 'The Data';
                          icon = '📊';
                        } else if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('advice')) {
                          title = 'Recommendations';
                          icon = '💡';
                        } else {
                          title = 'Observation';
                          icon = '📝';
                        }
                        
                        // Group paragraphs with same title
                        if (currentSection && currentSection.title === title) {
                          currentSection.paragraphs.push(paragraph);
                        } else {
                          if (currentSection) {
                            sections.push(currentSection);
                          }
                          currentSection = { title, icon, paragraphs: [paragraph] };
                        }
                      });
                      
                      if (currentSection) {
                        sections.push(currentSection);
                      }
                      
                      return sections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                              {section.icon} {section.title}
                            </span>
                            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                          </div>
                          <div className="space-y-3">
                            {section.paragraphs.map((para, paraIdx) => (
                              <p key={paraIdx} className="text-lg text-gray-800 leading-relaxed font-serif italic pl-4 border-l-2 border-cyan-300">
                                "{para.trim()}"
                              </p>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
                <span className="flex items-center gap-2">
                  <span className="text-purple-500">📅</span>
                  <span className="font-medium">{formatTimestamp(data.ts)}</span>
                </span>
                {data.sources && Array.isArray(data.sources) && data.sources.length > 0 && (
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-500">📊</span>
                    <span className="font-medium">{data.sources.join(', ')}</span>
                  </span>
                )}
                {data.features?.sources && typeof data.features.sources === 'object' && (
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-500">📊</span>
                    <span className="font-medium">{Object.values(data.features.sources).join(', ')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            {data.features && Object.keys(data.features).length > 0 && (
              <div className="bg-gradient-to-br from-white via-cyan-50 to-purple-50 rounded-2xl shadow-2xl p-6 border border-purple-200/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-cyan-600">
                    Environmental Metrics
                  </h3>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideEmpty}
                      onChange={(e) => setHideEmpty(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    Hide empty readings
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const features = data.features || {};
                    const processedKeys = new Set<string>();
                    const cards = [];
                    
                    // Automatically detect and pair ALL celsius/fahrenheit fields
                    const allKeys = Object.keys(features);
                    const celsiusKeys = allKeys.filter(k => 
                      k.includes('celsius') && 
                      !k.includes('temp_2m') && 
                      !k.includes('air_temp')
                    );
                    
                    celsiusKeys
                      .filter(celsiusKey => {
                        const fahrenheitKey = celsiusKey.replace('celsius', 'fahrenheit');
                        const cValue = features[celsiusKey];
                        const fValue = features[fahrenheitKey];
                        
                        // Always mark as processed
                        processedKeys.add(celsiusKey);
                        processedKeys.add(fahrenheitKey);
                        
                        // Check if BOTH values are empty
                        const cEmpty = isEmptyValue(cValue);
                        const fEmpty = isEmptyValue(fValue);
                        const bothEmpty = cEmpty && fEmpty;
                        
                        // If hideEmpty is checked and both are empty, filter out this card
                        if (hideEmpty && bothEmpty) {
                          return false; // Don't include this card
                        }
                        
                        return true; // Include this card
                      })
                      .forEach(celsiusKey => {
                        const fahrenheitKey = celsiusKey.replace('celsius', 'fahrenheit');
                        const cValue = features[celsiusKey];
                        const fValue = features[fahrenheitKey];
                        
                        // Extract label from key
                        let label = celsiusKey
                          .replace('_celsius', '')
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase());
                        
                        // Add appropriate icon
                        let icon = '🌡️';
                        if (celsiusKey.includes('sea')) icon = '🌊';
                        if (celsiusKey.includes('air') || celsiusKey.includes('temp_2m')) icon = '🌡️';
                        
                        cards.push(
                          <div key={celsiusKey} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
                            <div className="relative bg-white rounded-xl p-4 shadow-lg">
                              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                {icon} {label}
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="text-xs text-gray-400 mb-1">°C</div>
                                  <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-700 to-cyan-600">
                                    {formatMetricValue(cValue)}
                                  </div>
                                </div>
                                <div className="w-px h-12 bg-gray-300"></div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-400 mb-1">°F</div>
                                  <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-700 to-cyan-600">
                                    {formatMetricValue(fValue)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    
                    // Process all other metrics (non-temperature)
                    Object.entries(features)
                      .filter(([key, value]) => 
                        !processedKeys.has(key) &&
                        !key.includes('fahrenheit') && // Skip standalone fahrenheit fields
                        key !== 'sources' && 
                        key !== 'lat' && 
                        key !== 'lon' &&
                        key !== 'latitude' && 
                        key !== 'longitude' &&
                        typeof value !== 'object' &&
                        (!hideEmpty || !isEmptyValue(value))
                      )
                      .forEach(([key, value]) => {
                        cards.push(
                          <div key={key} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
                            <div className="relative bg-white rounded-xl p-4 shadow-lg">
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                {formatMetricName(key)}
                              </div>
                              <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-700 to-cyan-600">
                                {formatMetricValue(value)}
                      </div>
                      </div>
                    </div>
                        );
                      });
                    
                    return cards;
                  })()}
                </div>
              </div>
            )}

            {/* Events */}
            {data.events && data.events.length > 0 && (
              <div className="bg-gradient-to-br from-white via-purple-50 to-cyan-50 rounded-2xl shadow-2xl p-6 border border-purple-200/30">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-cyan-600 mb-6">
                  ⚠️ Detected Events
                </h3>
                <div className="space-y-3">
                  {data.events.map((event, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all ${getSeverityColor(event.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">
                          {event.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Event'}
                        </span>
                        {event.severity && (
                          <span className="px-4 py-1 rounded-full text-sm font-bold uppercase shadow-md">
                            {event.severity}
                          </span>
                        )}
                      </div>
                      {event.metric && (
                        <div className="text-sm font-medium mb-1">
                          Metric: <span className="font-bold">{formatMetricName(event.metric)}</span>
                        </div>
                      )}
                      {event.value && !isEmptyValue(event.value) && (
                        <div className="text-sm font-medium mb-1">
                          Value: <span className="font-bold">{formatMetricValue(event.value)}</span>
                        </div>
                      )}
                      {event.description && (
                        <div className="text-sm mt-2 italic opacity-90">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data (for debugging) */}
            <details className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 border border-cyan-500/30">
              <summary className="cursor-pointer font-bold text-cyan-300 hover:text-cyan-200 transition-colors text-lg">
                🔍 View Raw API Response
              </summary>
              <pre className="mt-4 bg-black/50 text-green-300 p-6 rounded-xl overflow-x-auto text-sm border border-green-500/20 shadow-inner">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

