import { HotelInquiryFormData } from '../utils/validation';
import { emailService } from './emailService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.rawhahbooking.com';

// Backward compatibility - keep the old single-stay payload
export interface HotelInquiryPayload {
  source: 'mobile';
  destination: {
    city: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  dates: {
    checkIn: string;
    checkOut: string;
  };
  rooms: number;
  guests: {
    adults: number;
    children: number;
    childAges?: number[];
  };
  budget?: {
    min?: number;
    max?: number;
  };
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  groupBooking: boolean;
  group?: {
    groupName?: string;
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    subGroups?: Array<{
      label: string;
      travelers: number;
    }>;
    coordinator?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  specialRequests?: string;
  appMeta: {
    appVersion: string;
    locale: string;
    currency: string;
  };
}

// Multi-Stay Hotel Inquiry Payload
export interface MultiStayHotelInquiryPayload {
  source: 'mobile' | 'web';
  stays: Array<{
    destination: { city: string; country?: string; lat?: number; lng?: number };
    dates: { checkIn: string; checkOut: string };
    rooms: number;
    hotelChoice: 
      | { type: 'specific'; hotelId: string; hotelName: string }
      | {
          type: 'preferences';
          rating?: 3 | 4 | 5;
          distanceMeters?: number;
          mealPlan?: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';
          budget?: { min?: number; max?: number };
          brands?: string[];
          facilities?: string[];
        };
    notes?: string;
  }>;
  travelers: {
    adults: number;
    children: number;
    childAges?: number[];
  };
  contact: { fullName: string; email: string; phone: string };
  groupBooking?: boolean;
  group?: {
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    subGroups?: { label: string; travelers: number }[];
    coordinator?: { name?: string; email?: string; phone?: string };
  };
  tripRequests?: string;
  appMeta?: { appVersion?: string; locale?: string; currency?: string };
}

export interface HotelInquiryResponse {
  id: string;
  status: 'received' | 'processing' | 'completed' | 'error';
  message?: string;
}

export interface DestinationSuggestion {
  city: string;
  country: string;
  region?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Submit hotel inquiry
  async submitHotelInquiry(formData: HotelInquiryFormData): Promise<HotelInquiryResponse> {
    try {
      // Generate unique inquiry ID
      const inquiryId = `HTL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const payload: HotelInquiryPayload = {
        source: 'mobile',
        destination: formData.destination,
        dates: formData.dates,
        rooms: formData.rooms,
        guests: formData.guests,
        budget: formData.budget,
        contact: formData.contact,
        groupBooking: formData.groupBooking,
        group: formData.group ? {
          totalTravelers: formData.group.totalTravelers,
          roomingPreference: formData.group.roomingPreference,
          subGroups: formData.group.subGroups,
          coordinator: formData.group.coordinator ? {
            name: formData.group.coordinator.name || '',
            phone: formData.group.coordinator.phone || '',
            email: formData.group.coordinator.email || '',
          } : undefined,
        } : undefined,
        specialRequests: formData.specialRequests,
        appMeta: {
          appVersion: '1.0.0', // Should come from app config
          locale: 'en', // Should come from i18n
          currency: 'USD', // Should come from user preferences
        },
      };

      console.log('Submitting hotel inquiry:', payload);

      // For now, simulate API call since we don't have a backend yet
      // In production, you would uncomment the actual API call below
      
      /*
      const response = await fetch(`${this.baseURL}/api/inquiries/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      */

      // Simulated successful response
      const result: HotelInquiryResponse = {
        id: inquiryId,
        status: 'received',
        message: 'Hotel inquiry received successfully'
      };

      console.log('Hotel inquiry submitted successfully:', result);

      // Send email notifications
      if (emailService) {
        try {
          // Send notification to admin
          await emailService.sendHotelInquiryNotification(formData, inquiryId);
          
          // Send confirmation to guest
          await emailService.sendGuestConfirmation(formData, inquiryId);
          
          console.log('Email notifications sent successfully');
        } catch (emailError) {
          console.error('Error sending email notifications:', emailError);
          // Don't fail the inquiry submission if emails fail
        }
      } else {
        console.warn('Email service not configured - skipping email notifications');
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting hotel inquiry:', error);
      throw error;
    }
  }

  // Search destinations (for autocomplete)
  async searchDestinations(query: string): Promise<DestinationSuggestion[]> {
    try {
      if (query.length < 2) return [];

      const response = await fetch(
        `${this.baseURL}/api/destinations?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('Destination search failed:', response.status);
        return [];
      }

      const data = await response.json();
      return data.destinations || [];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  // Get popular destinations
  async getPopularDestinations(): Promise<DestinationSuggestion[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/destinations/popular`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Popular destinations fetch failed:', response.status);
        return [];
      }

      const data = await response.json();
      return data.destinations || [];
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// WhatsApp integration
export const whatsAppService = {
  // Format message for WhatsApp
  formatMessage: (formData: HotelInquiryFormData): string => {
    const { destination, dates, guests, contact, groupBooking, group, budget, specialRequests } = formData;
    
    let message = `Hotel inquiry\n`;
    message += `Destination: ${destination.city}${destination.country ? `, ${destination.country}` : ''}\n`;
    message += `Dates: ${dates.checkIn} → ${dates.checkOut}\n`;
    message += `Guests: ${guests.adults} adults`;
    if (guests.children > 0) {
      message += `, ${guests.children} children`;
    }
    message += `\nRooms: ${formData.rooms}\n`;
    
    if (groupBooking && group) {
      message += `Group: Yes, total ${group.totalTravelers}\n`;
      if (group.roomingPreference) {
        message += `Rooming: ${group.roomingPreference}\n`;
      }
    } else {
      message += `Group: No\n`;
    }
    
    if (budget?.min || budget?.max) {
      message += `Budget: `;
      if (budget.min) message += `${budget.min}`;
      if (budget.min && budget.max) message += `-`;
      if (budget.max) message += `${budget.max}`;
      message += ` USD\n`;
    }
    
    message += `Name: ${contact.fullName}\n`;
    message += `Email: ${contact.email}\n`;
    message += `Phone: ${contact.phone}\n`;
    
    if (specialRequests) {
      message += `Notes: ${specialRequests}\n`;
    }
    
    message += `#HOTEL_INQUIRY`;
    
    return message;
  },

  // Generate WhatsApp deep link
  generateWhatsAppLink: (formData: HotelInquiryFormData): string => {
    const wabaNumber = process.env.EXPO_PUBLIC_WABA_NUMBER;
    if (!wabaNumber) {
      console.error('WABA number not configured');
      return '';
    }

    const message = whatsAppService.formatMessage(formData);
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${wabaNumber}?text=${encodedMessage}`;
  },
};

export default apiService; 