import AsyncStorage from '@react-native-async-storage/async-storage';
import topAirports from '../assets/data/top_airports.json';

export type AirportOption = {
  iata: string;
  name: string;
  city: string;
  region?: string;
  country: string;
  lat?: number;
  lon?: number;
  source: 'local' | 'api';
  type: 'airport' | 'city';
};

// Cache for all airports to avoid repeated API calls

// Cache for API results during session
const sessionCache = new Map<string, AirportOption[]>();
let abortController: AbortController | null = null;

// Storage keys
const RECENT_SEARCHES_KEY = 'recent_airport_searches';
const CACHED_AIRPORTS_KEY = 'cached_top_airports';

// Duffel API configuration
const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_API_TOKEN = process.env.EXPO_PUBLIC_DUFFEL_API_TOKEN;

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Normalize text for searching (remove diacritics, lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}

/**
 * Search local airports by query
 */
function searchLocalAirports(query: string): AirportOption[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = normalizeText(query);
  
  return (topAirports as AirportOption[]).filter(airport => {
    const searchableText = [
      airport.city,
      airport.name,
      airport.iata,
      airport.region,
      airport.country
    ].join(' ').toLowerCase();
    
    const normalizedSearchable = normalizeText(searchableText);
    return normalizedSearchable.includes(normalizedQuery);
  }).slice(0, 10);
}

/**
 * Search airports via Duffel API
 */
async function searchDuffelAirports(query: string): Promise<AirportOption[]> {
  if (!DUFFEL_API_TOKEN) {
    console.warn('Duffel API token not configured');
    return [];
  }

  console.log('Searching Duffel API for:', query);

  try {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    // For now, fetch a reasonable number of airports and filter locally
    // This provides a good balance between performance and coverage
    const params = new URLSearchParams({ limit: '2000' }); // Increased to include major international airports
    const url = `${DUFFEL_API_BASE}/air/airports?${params}`;
     
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2'
      },
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Duffel API error: ${response.status}`);
    }

    const data = await response.json();
    const allAirports = data.data.map((airport: any): AirportOption => ({
      iata: airport.iata_code,
      name: airport.name,
      city: airport.city_name || airport.name,
      region: airport.region,
      country: airport.iata_country_code || 'Unknown',
      lat: airport.latitude,
      lon: airport.longitude,
      source: 'api' as const,
      type: 'airport'
    }));

    // Debug: Log some sample airports to see what we're getting
    console.log('Sample airports fetched:', 
      allAirports.slice(0, 5).map((a: AirportOption) => `${a.iata}: ${a.name} (${a.city})`),
      'Total:', allAirports.length
    );

    // Check if any London airports are in the dataset
    const londonAirports = allAirports.filter((airport: AirportOption) => {
      const nameMatch = normalizeText(airport.name).includes('london');
      const cityMatch = normalizeText(airport.city).includes('london');
      const iataMatch = ['lhr', 'lgw', 'stn', 'ltn', 'lcy'].includes(normalizeText(airport.iata));
      return nameMatch || cityMatch || iataMatch;
    });
    console.log('London airports found in dataset:', londonAirports.length, londonAirports.map((a: AirportOption) => `${a.iata}: ${a.name}`));

    // Filter airports based on the search query
    const normalizedQuery = normalizeText(query);
    const filteredAirports = allAirports.filter((airport: AirportOption) => {
      const nameMatch = normalizeText(airport.name).includes(normalizedQuery);
      const cityMatch = normalizeText(airport.city).includes(normalizedQuery);
      const iataMatch = normalizeText(airport.iata).includes(normalizedQuery);
      const countryMatch = normalizeText(airport.country).includes(normalizedQuery);
      
      return nameMatch || cityMatch || iataMatch || countryMatch;
    });

    console.log(`Filtered ${filteredAirports.length} airports from ${allAirports.length} total`);
    
    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = filteredAirports.sort((a: AirportOption, b: AirportOption) => {
      const aExactMatch = normalizeText(a.iata) === normalizedQuery || 
                         normalizeText(a.city) === normalizedQuery;
      const bExactMatch = normalizeText(b.iata) === normalizedQuery || 
                         normalizeText(b.city) === normalizedQuery;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Secondary sort by city name
      return a.city.localeCompare(b.city);
    });
    
    return sortedResults.slice(0, 10); // Return top 10 matches

  } catch (error) {
    console.error('Duffel API search error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    return [];
  }
}

/**
 * Main search function that combines local and API results
 */
export async function searchAirports(query: string): Promise<AirportOption[]> {
  if (!query || query.length < 2) {
    return [];
  }

  // Check session cache first
  const cacheKey = query.toLowerCase();
  if (sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey)!;
  }

  // Get local results immediately
  const localResults = searchLocalAirports(query);
  
  // If we have good local results, return them while API loads
  if (localResults.length >= 5) {
    // Start API search in background
    searchDuffelAirports(query).then(apiResults => {
      if (apiResults.length > 0) {
        // Merge and deduplicate results
        const mergedResults = mergeResults(localResults, apiResults);
        sessionCache.set(cacheKey, mergedResults);
      }
    }).catch(() => {
      // API failed, cache local results
      sessionCache.set(cacheKey, localResults);
    });
    
    return localResults;
  }

  // If local results are limited, wait for API
  try {
    const apiResults = await searchDuffelAirports(query);
    const mergedResults = mergeResults(localResults, apiResults);
    
    // Cache results
    sessionCache.set(cacheKey, mergedResults);
    
    return mergedResults;
  } catch (error) {
    // API failed, return local results
    sessionCache.set(cacheKey, localResults);
    return localResults;
  }
}

/**
 * Merge and deduplicate local and API results
 */
function mergeResults(localResults: AirportOption[], apiResults: AirportOption[]): AirportOption[] {
  const seen = new Set<string>();
  const merged: AirportOption[] = [];

  // Add API results first (they're usually more comprehensive)
  for (const airport of apiResults) {
    if (!seen.has(airport.iata)) {
      seen.add(airport.iata);
      merged.push(airport);
    }
  }

  // Add local results that aren't already included
  for (const airport of localResults) {
    if (!seen.has(airport.iata)) {
      seen.add(airport.iata);
      merged.push(airport);
    }
  }

  return merged.slice(0, 10);
}

/**
 * Get nearest airports based on user location
 */
export function nearestAirports(lat: number, lon: number, limit: number = 5): AirportOption[] {
  return (topAirports as AirportOption[])
    .filter(airport => airport.lat && airport.lon)
    .map(airport => ({
      ...airport,
      distance: calculateDistance(lat, lon, airport.lat!, airport.lon!)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ distance, ...airport }) => airport);
}

/**
 * Get recent searches from storage
 */
export async function getRecentSearches(): Promise<AirportOption[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recent searches:', error);
    return [];
  }
}

/**
 * Save a search to recent searches
 */
export async function saveRecentSearch(airport: AirportOption): Promise<void> {
  try {
    const recent = await getRecentSearches();
    
    // Remove if already exists
    const filtered = recent.filter(item => item.iata !== airport.iata);
    
    // Add to beginning
    const updated = [airport, ...filtered].slice(0, 10);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Get top airports for initial display
 */
export function getTopAirports(limit: number = 20): AirportOption[] {
  return (topAirports as AirportOption[]).slice(0, limit);
}

/**
 * Clear session cache
 */
export function clearSessionCache(): void {
  sessionCache.clear();
}

/**
 * Format airport for display
 */
export function formatAirportDisplay(airport: AirportOption): string {
  const region = airport.region ? `, ${airport.region}` : '';
  return `${airport.city}${region} — ${airport.name} (${airport.iata}) • ${airport.country}`;
}

/**
 * Format airport for compact display (used in input fields)
 */
export function formatAirportCompact(airport: AirportOption): string {
  const region = airport.region ? `, ${airport.region}` : '';
  return `${airport.city}${region} (${airport.iata})`;
} 