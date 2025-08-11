// Production-ready Duffel API service using Supabase Edge Functions
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// Backend API Configuration 
const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

// Types (matching Duffel API and our backend)
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
  given_name?: string;
  family_name?: string;
  loyalty_programme_accounts?: Array<{
    airline_iata_code: string;
    account_number: string;
  }>;
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

export interface CustomerUser {
  id: string;
  duffel_id: string;
  email: string;
  given_name: string;
  family_name: string;
  phone_number?: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
}

class DuffelApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
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
    max_connections: 1, // Use Duffel best practice
    supplier_timeout: 20000, // 20 second timeout
  };
}

// Get authentication headers for Supabase
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '', // Always include anon key
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('🔐 Using authenticated session for API calls');
    } else {
      // Use anon key when not authenticated
      headers['Authorization'] = `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`;
      console.log('📱 Making unauthenticated API call with anon key');
    }

    return headers;
  } catch (error) {
    console.warn('Could not get auth session:', error);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    };
  }
}

// Supabase Edge Function request wrapper
async function callEdgeFunction<T>(
  functionName: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    const url = `${FUNCTIONS_URL}/${functionName}`;
    
    console.log(`🌐 Calling Edge Function: ${functionName}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = (isJson ? await response.json() : await response.text()) as any;

    if (!response.ok || !data.success) {
      const errorMessage = data?.error || 'Backend request failed';
      const errorCode = data?.code;
      const details = data?.details;
      
      console.error('Edge Function Error:', {
        function: functionName,
        status: response.status,
        message: errorMessage,
        code: errorCode,
        details
      });
      
      throw new DuffelApiError(
        errorMessage,
        response.status,
        errorCode,
        details
      );
    }

    console.log(`✅ Edge Function Success: ${functionName}`);
    return data.data as T;
  } catch (error) {
    if (error instanceof DuffelApiError) throw error;
    console.error('Network/Parse Error:', error);
    throw new DuffelApiError('Network error occurred. Please check your connection.');
  }
}

// Production-Ready Duffel API Service
const DuffelApiService = {
  // Flight search via Edge Function
  async searchOffers(request: AppSearchParams | DuffelOfferRequest): Promise<{ data: DuffelOffer[] }> {
    try {
      // Transform app params to Duffel format if needed
      let searchRequest: DuffelOfferRequest;
      if ('from' in request) {
        // App format - transform it
        searchRequest = transformAppParamsToDuffel(request as AppSearchParams);
        console.log('Transformed search params for backend:', JSON.stringify(searchRequest, null, 2));
      } else {
        // Already Duffel format
        searchRequest = request as DuffelOfferRequest;
      }
      
      const response = await callEdgeFunction<any>('flight-search', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
      });
      
      console.log(`✈️ Flight search successful: Found ${response.offers?.length || 0} offers`);
      return { data: response.offers || [] };
    } catch (error) {
      console.error('Error searching flights via backend:', error);
      
      if (error instanceof DuffelApiError) {
        // Show specific error messages to user
        if (error.code === 'invalid_date') {
          Alert.alert('Invalid Date', error.message);
        } else if (error.status === 401) {
          // Skip authentication errors - guest users are allowed
          console.log('Guest user proceeding without authentication');
        } else if (error.status === 403) {
          Alert.alert('Access Denied', 'Unable to access this service. Please try again later.');
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

  // Get specific offer via Edge Function
  async getOffer(offerId: string): Promise<{ data: DuffelOffer }> {
    try {
      const response = await callEdgeFunction<DuffelOffer>(`flight-search/${offerId}`, {
        method: 'GET'
      });
      return { data: response };
    } catch (error) {
      console.error('Error getting offer:', error);
      throw error;
    }
  },

  // Create booking via Edge Function (will be implemented in Phase 3)
  async createOrder(payload: any): Promise<{ data: DuffelOrder }> {
    try {
      const response = await callEdgeFunction<DuffelOrder>('order-management', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { data: response };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get booking details via Edge Function
  async getOrder(orderId: string): Promise<{ data: DuffelOrder }> {
    try {
      const response = await callEdgeFunction<DuffelOrder>(`order-management/${orderId}`, {
        method: 'GET'
      });
      return { data: response };
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  // Search airports via Edge Function
  async searchAirports(query: string): Promise<{ data: DuffelAirport[] }> {
    try {
      const params = new URLSearchParams({ q: query, limit: '10' });
      const response = await callEdgeFunction<DuffelAirport[]>(`airports?${params}`, {
        method: 'GET'
      });
      return { data: response };
    } catch (error) {
      console.error('Error searching airports:', error);
      throw error;
    }
  },

  // Customer management
  async createCustomerUser(userData: {
    email: string;
    given_name: string;
    family_name: string;
    phone_number?: string;
  }): Promise<CustomerUser> {
    try {
      const response = await callEdgeFunction<CustomerUser>('customer-management', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error('Error creating customer user:', error);
      throw error;
    }
  },

  async getCustomerUser(): Promise<CustomerUser | null> {
    try {
      const response = await callEdgeFunction<CustomerUser | null>('customer-management', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error getting customer user:', error);
      return null;
    }
  },

  // Health check for backend connectivity
  async ping(): Promise<boolean> {
    try {
      await callEdgeFunction('flight-search', { method: 'GET' });
      return true;
    } catch (_) {
      return false;
    }
  },
  
  // Test flight search with valid future date
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