// Backend-proxied Duffel API wrapper for React Native
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// Backend API Configuration 
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.rawhahbooking.com';
const API_VERSION = 'v1';

// Types (matching Duffel API)
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
    max_connections: 2,
    supplier_timeout: 20000,
  };
}

// Get authentication headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  } catch (error) {
    console.warn('Could not get auth session, proceeding without auth:', error);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
}

// Backend API Request wrapper
async function backendApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
    
    console.log(`🌐 Backend API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = (isJson ? await response.json() : await response.text()) as any;

    if (!response.ok || (data && data.error)) {
      const errorMessage = data?.error?.message || data?.message || 'Backend API request failed';
      const errorCode = data?.error?.code || data?.code;
      
      console.error('Backend API Error:', {
        status: response.status,
        message: errorMessage,
        code: errorCode,
        url: url,
        response: data
      });
      
      const err = new DuffelApiError(
        errorMessage,
        response.status,
        errorCode
      );
      throw err;
    }

    console.log(`✅ Backend API Success: ${endpoint}`);
    return data as T;
  } catch (error) {
    if (error instanceof DuffelApiError) throw error;
    console.error('Network/Parse Error:', error);
    throw new DuffelApiError('Network error occurred. Please check your connection.');
  }
}

// Backend-Proxied Duffel API Service
const DuffelApiService = {
  // Flight search via backend
  async searchOffers(request: AppSearchParams | DuffelOfferRequest): Promise<{ data: DuffelOffer[] }> {
    try {
      // Transform app params to Duffel format if needed
      let searchRequest: any;
      if ('from' in request) {
        // App format - transform it
        searchRequest = transformAppParamsToDuffel(request as AppSearchParams);
        console.log('Transformed search params:', JSON.stringify(searchRequest, null, 2));
      } else {
        // Already Duffel format
        searchRequest = request as DuffelOfferRequest;
      }
      
      const response = await backendApiRequest<{ data: DuffelOffer[] }>('/flights/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
      });
      
      console.log(`✈️ Flight search successful: Found ${response.data?.length || 0} offers`);
      return response;
    } catch (error) {
      console.error('Error searching flights via backend:', error);
      
      if (error instanceof DuffelApiError) {
        // Show specific error messages to user
        if (error.code === 'invalid_date') {
          Alert.alert('Invalid Date', error.message);
        } else if (error.status === 401) {
          Alert.alert('Authentication Error', 'Please log in to search flights.');
        } else if (error.status === 403) {
          Alert.alert('Access Denied', 'You do not have permission to search flights.');
        } else if (error.status && error.status >= 500) {
          Alert.alert('Service Error', 'Our flight search service is temporarily unavailable. Please try again later.');
        } else {
          Alert.alert('Search Error', error.message);
        }
      } else {
        Alert.alert('Search Error', 'Unable to search for flights. Please check your connection and try again.');
      }
      
      throw error;
    }
  },

  // Get specific offer via backend
  async getOffer(offerId: string): Promise<{ data: DuffelOffer }> {
    return backendApiRequest<{ data: DuffelOffer }>(`/flights/offers/${offerId}`);
  },

  // Create booking via backend
  async createOrder(payload: any): Promise<{ data: DuffelOrder }> {
    return backendApiRequest<{ data: DuffelOrder }>('/flights/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get booking details via backend
  async getOrder(orderId: string): Promise<{ data: DuffelOrder }> {
    return backendApiRequest<{ data: DuffelOrder }>(`/flights/bookings/${orderId}`);
  },

  // Search airports via backend
  async searchAirports(query: string): Promise<{ data: DuffelAirport[] }> {
    const params = new URLSearchParams({ q: query, limit: '10' });
    return backendApiRequest<{ data: DuffelAirport[] }>(`/utils/airports?${params}`);
  },

  // Health check for backend connectivity
  async ping(): Promise<boolean> {
    try {
      await backendApiRequest('/utils/airports?limit=1');
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