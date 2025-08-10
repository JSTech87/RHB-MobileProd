import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  DuffelOffer, 
  DuffelOfferRequest, 
  DuffelOrder, 
  DuffelPassenger,
  MarkupRule 
} from './duffelApi';
import { User, AuthTokens } from './authService';

// Backend API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.rawhahbooking.com';
const API_VERSION = 'v1';

// API Endpoints
const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `/api/${API_VERSION}/auth/login`,
    REGISTER: `/api/${API_VERSION}/auth/register`,
    REFRESH: `/api/${API_VERSION}/auth/refresh`,
    LOGOUT: `/api/${API_VERSION}/auth/logout`,
    PROFILE: `/api/${API_VERSION}/auth/profile`,
    RESET_PASSWORD: `/api/${API_VERSION}/auth/reset-password`,
    VERIFY_EMAIL: `/api/${API_VERSION}/auth/verify-email`,
    ADMIN_LOGIN: `/api/${API_VERSION}/auth/admin/login`,
  },
  
  // Flight Services
  FLIGHTS: {
    SEARCH: `/api/${API_VERSION}/flights/search`,
    OFFERS: `/api/${API_VERSION}/flights/offers`,
    BOOK: `/api/${API_VERSION}/flights/book`,
    BOOKINGS: `/api/${API_VERSION}/flights/bookings`,
    CANCEL: `/api/${API_VERSION}/flights/cancel`,
  },
  
  // Hotel Services
  HOTELS: {
    INQUIRY: `/api/${API_VERSION}/hotels/inquiry`,
    INQUIRIES: `/api/${API_VERSION}/hotels/inquiries`,
  },
  
  // User Management
  USERS: {
    PROFILE: `/api/${API_VERSION}/users/profile`,
    FAMILY: `/api/${API_VERSION}/users/family`,
    PREFERENCES: `/api/${API_VERSION}/users/preferences`,
    DOCUMENTS: `/api/${API_VERSION}/users/documents`,
  },
  
  // Admin Services
  ADMIN: {
    DASHBOARD: `/api/${API_VERSION}/admin/dashboard`,
    USERS: `/api/${API_VERSION}/admin/users`,
    BOOKINGS: `/api/${API_VERSION}/admin/bookings`,
    ANALYTICS: `/api/${API_VERSION}/admin/analytics`,
    MARKUP_RULES: `/api/${API_VERSION}/admin/markup-rules`,
    SETTINGS: `/api/${API_VERSION}/admin/settings`,
  },
  
  // Utility Services
  UTILS: {
    AIRPORTS: `/api/${API_VERSION}/utils/airports`,
    AIRLINES: `/api/${API_VERSION}/utils/airlines`,
    COUNTRIES: `/api/${API_VERSION}/utils/countries`,
    CURRENCIES: `/api/${API_VERSION}/utils/currencies`,
  },
};

// Error Classes
export class BackendApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface FlightSearchRequest extends DuffelOfferRequest {
  userId?: string;
  preferences?: {
    preferredAirlines?: string[];
    maxPrice?: number;
    maxDuration?: number;
    seatPreferences?: string[];
  };
}

export interface FlightBookingRequest {
  offerId: string;
  passengers: DuffelPassenger[];
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  paymentInfo: {
    method: 'card' | 'bank_transfer' | 'wallet';
    cardToken?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  specialRequests?: string[];
  marketingConsent: boolean;
  termsAccepted: boolean;
}

export interface HotelInquiryRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  preferences: {
    starRating?: number[];
    priceRange?: {
      min: number;
      max: number;
    };
    amenities?: string[];
    location?: string[];
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  specialRequests?: string;
  isGroupBooking: boolean;
  groupDetails?: {
    groupSize: number;
    groupType: string;
    eventDate?: string;
    specialRequirements?: string;
  };
}

// HTTP Client
class HttpClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const tokens = await AsyncStorage.getItem('@rawhah_tokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens) as AuthTokens;
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get auth tokens:', error);
    }

    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new BackendApiError(
          data.error?.message || 'Request failed',
          response.status,
          data.error?.code,
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BackendApiError) {
        throw error;
      }
      
      console.error('HTTP request failed:', error);
      throw new BackendApiError(
        'Network error occurred. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Backend API Service
export class BackendApiService {
  // Authentication Services
  static async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await HttpClient.post<{ user: User; tokens: AuthTokens }>(
      ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Login failed');
    }
    
    return response.data;
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await HttpClient.post<{ user: User; tokens: AuthTokens }>(
      ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Registration failed');
    }
    
    return response.data;
  }

  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await HttpClient.post<AuthTokens>(
      ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Token refresh failed');
    }
    
    return response.data;
  }

  static async logout(): Promise<void> {
    await HttpClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await HttpClient.put<User>(ENDPOINTS.AUTH.PROFILE, updates);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Profile update failed');
    }
    
    return response.data;
  }

  // Flight Services
  static async searchFlights(searchRequest: FlightSearchRequest): Promise<{
    offers: DuffelOffer[];
    searchId: string;
    expiresAt: string;
  }> {
    const response = await HttpClient.post<{
      offers: DuffelOffer[];
      searchId: string;
      expiresAt: string;
    }>(ENDPOINTS.FLIGHTS.SEARCH, searchRequest);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Flight search failed');
    }
    
    return response.data;
  }

  static async getFlightOffer(offerId: string): Promise<DuffelOffer> {
    const response = await HttpClient.get<DuffelOffer>(`${ENDPOINTS.FLIGHTS.OFFERS}/${offerId}`);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to get flight offer');
    }
    
    return response.data;
  }

  static async bookFlight(bookingRequest: FlightBookingRequest): Promise<{
    order: DuffelOrder;
    bookingReference: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    confirmationEmail: boolean;
  }> {
    const response = await HttpClient.post<{
      order: DuffelOrder;
      bookingReference: string;
      paymentStatus: 'pending' | 'completed' | 'failed';
      confirmationEmail: boolean;
    }>(ENDPOINTS.FLIGHTS.BOOK, bookingRequest);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Flight booking failed');
    }
    
    return response.data;
  }

  static async getUserBookings(params?: {
    status?: 'all' | 'upcoming' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<{
    bookings: Array<{
      id: string;
      bookingReference: string;
      status: 'confirmed' | 'pending' | 'cancelled';
      type: 'flight' | 'hotel';
      totalAmount: number;
      currency: string;
      createdAt: string;
      itinerary: any;
      passengers?: any[];
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${ENDPOINTS.FLIGHTS.BOOKINGS}?${queryParams}`;
    const response = await HttpClient.get<{
      bookings: Array<{
        id: string;
        bookingReference: string;
        status: 'confirmed' | 'pending' | 'cancelled';
        type: 'flight' | 'hotel';
        totalAmount: number;
        currency: string;
        createdAt: string;
        itinerary: any;
        passengers?: any[];
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to get user bookings');
    }
    
    return response.data;
  }

  // Hotel Services
  static async submitHotelInquiry(inquiryRequest: HotelInquiryRequest): Promise<{
    inquiryId: string;
    status: 'submitted' | 'processing' | 'quoted' | 'booked';
    estimatedResponse: string;
    whatsappContact?: string;
  }> {
    const response = await HttpClient.post<{
      inquiryId: string;
      status: 'submitted' | 'processing' | 'quoted' | 'booked';
      estimatedResponse: string;
      whatsappContact?: string;
    }>(ENDPOINTS.HOTELS.INQUIRY, inquiryRequest);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Hotel inquiry submission failed');
    }
    
    return response.data;
  }

  // User Management Services
  static async getFamilyMembers(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: string;
    profileImage?: string;
    documents: Array<{
      type: string;
      url: string;
      expiryDate?: string;
    }>;
  }>> {
    const response = await HttpClient.get<Array<{
      id: string;
      firstName: string;
      lastName: string;
      relationship: string;
      dateOfBirth: string;
      nationality: string;
      passportNumber: string;
      passportExpiry: string;
      profileImage?: string;
      documents: Array<{
        type: string;
        url: string;
        expiryDate?: string;
      }>;
    }>>(ENDPOINTS.USERS.FAMILY);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to get family members');
    }
    
    return response.data;
  }

  static async addFamilyMember(memberData: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: string;
    profileImage?: string;
  }): Promise<{ id: string }> {
    const response = await HttpClient.post<{ id: string }>(
      ENDPOINTS.USERS.FAMILY,
      memberData
    );
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to add family member');
    }
    
    return response.data;
  }

  // Utility Services
  static async searchAirports(query: string): Promise<Array<{
    iata_code: string;
    name: string;
    city_name: string;
    country_code: string;
    country_name: string;
    time_zone: string;
  }>> {
    const response = await HttpClient.get<Array<{
      iata_code: string;
      name: string;
      city_name: string;
      country_code: string;
      country_name: string;
      time_zone: string;
    }>>(`${ENDPOINTS.UTILS.AIRPORTS}?q=${encodeURIComponent(query)}`);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Airport search failed');
    }
    
    return response.data;
  }

  // Admin Services
  static async getAdminDashboard(): Promise<{
    stats: {
      totalBookings: number;
      totalRevenue: number;
      totalUsers: number;
      pendingInquiries: number;
    };
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      user?: string;
    }>;
    topRoutes: Array<{
      route: string;
      bookings: number;
      revenue: number;
    }>;
  }> {
    const response = await HttpClient.get<{
      stats: {
        totalBookings: number;
        totalRevenue: number;
        totalUsers: number;
        pendingInquiries: number;
      };
      recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        user?: string;
      }>;
      topRoutes: Array<{
        route: string;
        bookings: number;
        revenue: number;
      }>;
    }>(ENDPOINTS.ADMIN.DASHBOARD);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to get admin dashboard');
    }
    
    return response.data;
  }

  static async getMarkupRules(): Promise<MarkupRule[]> {
    const response = await HttpClient.get<MarkupRule[]>(ENDPOINTS.ADMIN.MARKUP_RULES);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to get markup rules');
    }
    
    return response.data;
  }

  static async createMarkupRule(rule: Omit<MarkupRule, 'id' | 'created_at' | 'updated_at'>): Promise<MarkupRule> {
    const response = await HttpClient.post<MarkupRule>(ENDPOINTS.ADMIN.MARKUP_RULES, rule);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to create markup rule');
    }
    
    return response.data;
  }

  static async updateMarkupRule(id: string, updates: Partial<MarkupRule>): Promise<MarkupRule> {
    const response = await HttpClient.put<MarkupRule>(`${ENDPOINTS.ADMIN.MARKUP_RULES}/${id}`, updates);
    
    if (!response.success || !response.data) {
      throw new BackendApiError('Failed to update markup rule');
    }
    
    return response.data;
  }

  static async deleteMarkupRule(id: string): Promise<void> {
    const response = await HttpClient.delete(`${ENDPOINTS.ADMIN.MARKUP_RULES}/${id}`);
    
    if (!response.success) {
      throw new BackendApiError('Failed to delete markup rule');
    }
  }

  // Error Handling Utilities
  static handleApiError(error: any): string {
    if (error instanceof BackendApiError) {
      return error.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  static showErrorAlert(error: any, title: string = 'Error') {
    const message = this.handleApiError(error);
    Alert.alert(title, message);
  }
}

export default BackendApiService; 