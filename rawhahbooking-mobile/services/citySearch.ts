import topCities from '../assets/data/top_cities.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CityOption {
  id: string;
  city: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  popularityScore?: number;
  source: 'local' | 'remote';
}

const RECENT_KEY = 'recent.cities.v1';

// --- Local search (simple substring match) -----------------------------
export const searchLocalCities = (query: string): CityOption[] => {
  if (!query) return [];
  const q = query.toLowerCase();
  return (topCities as CityOption[])
    .filter(c => `${c.city}, ${c.country}`.toLowerCase().includes(q))
    .slice(0, 10)
    .map(c => ({ ...c, source: 'local' }));
};

// --- Remote search using Google Places ---------------------------------
export const searchGoogleCities = async (query: string): Promise<CityOption[]> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  if (!key || query.length < 2) return [];

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&language=en&key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.predictions) return [];

    return data.predictions.slice(0, 10).map((p: any): CityOption => ({
      id: p.place_id,
      city: p.structured_formatting.main_text,
      country: p.structured_formatting.secondary_text || '',
      lat: 0,
      lon: 0,
      source: 'remote',
    }));
  } catch (err) {
    console.warn('Google Places error', err);
    return [];
  }
};

// --- Merge helper -------------------------------------------------------
export const mergeCityResults = (local: CityOption[], remote: CityOption[]): CityOption[] => {
  const seen = new Set<string>();
  const all = [...local, ...remote];
  const deduped: CityOption[] = [];
  for (const c of all) {
    if (!seen.has(c.city + c.country)) {
      seen.add(c.city + c.country);
      deduped.push(c);
    }
  }
  return deduped.slice(0, 10);
};

export const searchCities = async (query: string): Promise<CityOption[]> => {
  const local = searchLocalCities(query);
  const remote = await searchGoogleCities(query);
  return mergeCityResults(local, remote);
};

// --- Recent utilities ---------------------------------------------------
export const getRecentCities = async (): Promise<CityOption[]> => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveRecentCity = async (city: CityOption) => {
  try {
    const recents = await getRecentCities();
    const updated = [city, ...recents.filter(c => c.id !== city.id)].slice(0, 5);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
};

export const getTopCities = (): CityOption[] => {
  return (topCities as CityOption[]).slice(0, 10).map(c => ({ ...c, source: 'local' }));
}; 