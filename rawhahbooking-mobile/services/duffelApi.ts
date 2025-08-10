// Lightweight Duffel API wrapper for React Native (fetch-based)
import { Alert } from 'react-native';

// Duffel API Configuration (mobile should ONLY use test tokens; for prod use a backend proxy)
const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_API_TOKEN = process.env.EXPO_PUBLIC_DUFFEL_API_TOKEN || '';

// API Headers (v2 per migration guide)
const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${DUFFEL_API_TOKEN}`,
  'Duffel-Version': 'v2',
});

// Types (subset)
export interface DuffelAirport {
  iata_code: string;
  name: string;
  city_name: string;
  iata_country_code?: string;
}

export interface DuffelSliceRequest {
  origin: string;
  destination: string;
  departure_date: string; // YYYY-MM-DD
}

export interface DuffelPassengerRequest {
  type: 'adult' | 'child' | 'infant_without_seat';
  age?: number;
}

export interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Array<{
    id: string;
    duration: string; // PT#H#M
    origin: { iata_code: string; name: string };
    destination: { iata_code: string; name: string };
    departing_at: string;
    arriving_at: string;
    segments: Array<{
      id: string;
      operating_carrier: { iata_code: string; name: string };
    }>;
  }>;
}

export interface DuffelOfferRequest {
  cabin_class?: 'first' | 'business' | 'premium_economy' | 'economy';
  passengers: DuffelPassengerRequest[];
  slices: DuffelSliceRequest[];
  return_offers?: boolean;
  max_connections?: number;
  supplier_timeout?: number;
}

export interface DuffelOrder {
  id: string;
  booking_reference: string;
}

class DuffelApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DuffelApiError';
  }
}

// API Request wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${DUFFEL_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = (isJson ? await response.json() : await response.text()) as any;

    if (!response.ok || (data && data.errors)) {
      const err = new DuffelApiError(
        data?.errors?.[0]?.message || 'API request failed',
        response.status,
        data?.errors?.[0]?.code
      );
      throw err;
    }

    return data as T;
  } catch (error) {
    if (error instanceof DuffelApiError) throw error;
    throw new DuffelApiError('Network error occurred');
  }
}

// Duffel API Service
const DuffelApiService = {
  // Offer requests (creates and returns offers immediately when return_offers=true)
  async searchOffers(request: DuffelOfferRequest): Promise<{ data: { offers: DuffelOffer[] } }> {
    try {
      const res = await apiRequest<{ data: { offers: DuffelOffer[] } }>(`/air/offer_requests`, {
        method: 'POST',
        body: JSON.stringify({ data: { ...request, return_offers: true } }),
      });
      return res;
    } catch (error) {
      console.error('Error searching offers:', error);
      Alert.alert('Search Error', 'Unable to search for flights. Please try again.');
      throw error;
    }
  },

  async getOffer(offerId: string): Promise<{ data: DuffelOffer }> {
    return apiRequest<{ data: DuffelOffer }>(`/air/offers/${offerId}`);
  },

  async createOrder(payload: any): Promise<{ data: DuffelOrder }> {
    // Note (v2): passengers.type is removed for Create Order (IDs from offers are used)
    return apiRequest<{ data: DuffelOrder }>(`/air/orders`, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
    });
  },

  async getOrder(orderId: string): Promise<{ data: DuffelOrder }> {
    return apiRequest<{ data: DuffelOrder }>(`/air/orders/${orderId}`);
  },

  async searchAirports(query: string): Promise<{ data: DuffelAirport[] }> {
    const params = new URLSearchParams({ 'filter[name]': query, limit: '10' });
    return apiRequest<{ data: DuffelAirport[] }>(`/air/airports?${params}`);
  },

  // Simple connectivity test
  async ping(): Promise<boolean> {
    try {
      await apiRequest(`/air/airports?limit=1`);
      return true;
    } catch (_) {
      return false;
    }
  },
};

export default DuffelApiService; 