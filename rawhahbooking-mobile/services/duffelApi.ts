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

// App-specific interfaces for data transformation
export interface AppSearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants?: number;
    infantsInSeat?: number;
    infantsOnLap?: number;
  };
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  tripType: 'oneWay' | 'roundTrip' | 'multiCity';
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

// Helper functions for data transformation
function transformCabinClass(appCabinClass: string): string {
  const mapping: Record<string, string> = {
    'Economy': 'economy',
    'Premium Economy': 'premium_economy',
    'Business': 'business',
    'First': 'first'
  };
  return mapping[appCabinClass] || 'economy';
}

function transformPassengers(passengers: AppSearchParams['passengers']): DuffelPassengerRequest[] {
  const result: DuffelPassengerRequest[] = [];
  
  // Add adults
  for (let i = 0; i < passengers.adults; i++) {
    result.push({ type: 'adult' });
  }
  
  // Add children
  for (let i = 0; i < passengers.children; i++) {
    result.push({ type: 'child' });
  }
  
  // Add infants (combine all infant types)
  const totalInfants = (passengers.infants || 0) + 
                      (passengers.infantsInSeat || 0) + 
                      (passengers.infantsOnLap || 0);
  
  for (let i = 0; i < totalInfants; i++) {
    result.push({ type: 'infant_without_seat' });
  }
  
  return result;
}

function validateSearchDate(dateString: string): void {
  const searchDate = new Date(dateString);
  const today = new Date();
  const maxAdvanceBooking = new Date();
  maxAdvanceBooking.setFullYear(today.getFullYear() + 1); // 1 year ahead
  
  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  searchDate.setHours(0, 0, 0, 0);
  
  if (searchDate < today) {
    throw new DuffelApiError('Departure date cannot be in the past', 422, 'invalid_date');
  }
  
  if (searchDate > maxAdvanceBooking) {
    throw new DuffelApiError('Departure date cannot be more than 1 year in advance', 422, 'invalid_date');
  }
}

function transformAppParamsToDuffel(appParams: AppSearchParams): DuffelOfferRequest {
  // Validate dates
  validateSearchDate(appParams.departureDate);
  if (appParams.returnDate) {
    validateSearchDate(appParams.returnDate);
  }
  
  const slices: DuffelSliceRequest[] = [
    {
      origin: appParams.from,
      destination: appParams.to,
      departure_date: appParams.departureDate,
    }
  ];
  
  // Add return slice for round trips
  if (appParams.tripType === 'roundTrip' && appParams.returnDate) {
    slices.push({
      origin: appParams.to,
      destination: appParams.from,
      departure_date: appParams.returnDate,
    });
  }
  
  return {
    cabin_class: transformCabinClass(appParams.cabinClass) as DuffelOfferRequest['cabin_class'],
    passengers: transformPassengers(appParams.passengers),
    slices,
    return_offers: true,
    max_connections: 2, // Allow up to 2 connections
    supplier_timeout: 20000, // 20 second timeout
  };
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
      const errorMessage = data?.errors?.[0]?.message || 'API request failed';
      const errorCode = data?.errors?.[0]?.code;
      
      console.error('Duffel API Error:', {
        status: response.status,
        message: errorMessage,
        code: errorCode,
        errors: data?.errors
      });
      
      const err = new DuffelApiError(
        errorMessage,
        response.status,
        errorCode
      );
      throw err;
    }

    return data as T;
  } catch (error) {
    if (error instanceof DuffelApiError) throw error;
    console.error('Network/Parse Error:', error);
    throw new DuffelApiError('Network error occurred');
  }
}

// Duffel API Service
const DuffelApiService = {
  // Offer requests (creates and returns offers immediately when return_offers=true)
  async searchOffers(request: AppSearchParams | DuffelOfferRequest): Promise<{ data: DuffelOffer[] }> {
    try {
      // Check if token is configured
      if (!DUFFEL_API_TOKEN) {
        throw new DuffelApiError('Duffel API token not configured', 401, 'missing_token');
      }
      
      // Transform app params to Duffel format if needed
      let duffelRequest: DuffelOfferRequest;
      if ('from' in request) {
        // App format - transform it
        duffelRequest = transformAppParamsToDuffel(request as AppSearchParams);
        console.log('Transformed search params:', JSON.stringify(duffelRequest, null, 2));
      } else {
        // Already Duffel format
        duffelRequest = request as DuffelOfferRequest;
      }
      
      const res = await apiRequest<{ data: DuffelOffer[] }>(`/air/offer_requests`, {
        method: 'POST',
        body: JSON.stringify({ data: duffelRequest }),
      });
      
      console.log(`Search successful: Found ${res.data?.length || 0} offers`);
      return res;
    } catch (error) {
      console.error('Error searching offers:', error);
      
      if (error instanceof DuffelApiError) {
        // Show specific error messages to user
        if (error.code === 'invalid_date') {
          Alert.alert('Invalid Date', error.message);
        } else if (error.code === 'missing_token') {
          Alert.alert('Configuration Error', 'Flight search is not properly configured. Please contact support.');
        } else {
          Alert.alert('Search Error', error.message);
        }
      } else {
        Alert.alert('Search Error', 'Unable to search for flights. Please check your connection and try again.');
      }
      
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
  
  // Test flight search with better date
  async testSearch(): Promise<{ data: DuffelOffer[] }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // 7 days from now
    
    const testParams: AppSearchParams = {
      from: 'JFK',
      to: 'LAX',
      departureDate: tomorrow.toISOString().split('T')[0],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      cabinClass: 'Economy',
      tripType: 'oneWay'
    };
    
    return this.searchOffers(testParams);
  }
};

export default DuffelApiService; 