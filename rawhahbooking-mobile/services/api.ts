import { HotelInquiryFormData } from '../utils/validation';
import { emailService } from './emailService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.rawhahbooking.com';

// Sequential ID Generator - Professional booking reference system
interface BookingRecord {
  bookingId: string;
  sequenceNumber: number;
  datePart: string;
  serviceType: string;
  timestamp: Date;
}

/**
 * PRODUCTION DATABASE SCHEMA REQUIREMENTS:
 * 
 * Table: booking_sequences
 * Columns:
 *   - id: Primary key (auto-increment)
 *   - booking_id: VARCHAR(50) UNIQUE NOT NULL (e.g., 'RHB-HTL-20250808-0001')
 *   - sequence_number: INTEGER NOT NULL (1, 2, 3, ...)
 *   - date_part: VARCHAR(8) NOT NULL (e.g., '20250808')
 *   - service_type: VARCHAR(10) NOT NULL (e.g., 'HTL', 'FLT', 'PKG')
 *   - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *   - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * 
 * Indexes:
 *   - UNIQUE INDEX idx_booking_id ON booking_sequences(booking_id)
 *   - INDEX idx_date_service ON booking_sequences(date_part, service_type)
 *   - INDEX idx_sequence ON booking_sequences(date_part, service_type, sequence_number)
 * 
 * CONCURRENCY SAFETY:
 * 1. Use database transactions with SELECT FOR UPDATE
 * 2. Alternative: Use Redis atomic counters with daily expiration
 * 3. Implement retry logic for race condition handling
 * 
 * PRODUCTION IMPLEMENTATION:
 * ```sql
 * BEGIN TRANSACTION;
 * 
 * SELECT MAX(sequence_number) 
 * FROM booking_sequences 
 * WHERE date_part = ? AND service_type = ? 
 * FOR UPDATE;
 * 
 * INSERT INTO booking_sequences 
 * (booking_id, sequence_number, date_part, service_type) 
 * VALUES (?, ?, ?, ?);
 * 
 * COMMIT;
 * ```
 */

// In-memory storage for demo (replace with actual database in production)
const bookingStorage: BookingRecord[] = [];

/**
 * Generates sequential daily booking IDs in format: RHB-HTL-YYYYMMDD-####
 * @param serviceType Service type (HTL, FLT, PKG, etc.)
 * @returns Promise<string> Generated booking ID
 */
async function generateSequentialRequestId(serviceType: string): Promise<string> {
  try {
    // Get current date in UTC
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
    
    console.log(`Generating ${serviceType} booking ID for date: ${datePart}`);
    
    // Simulate database transaction for concurrency safety
    // In production, this should use actual database transactions
    const todaysBookings = bookingStorage
      .filter(record => record.datePart === datePart && record.serviceType === serviceType)
      .sort((a, b) => b.sequenceNumber - a.sequenceNumber);
    
    // Get next sequence number (starts at 1 each day)
    const nextSequence = todaysBookings.length > 0 ? todaysBookings[0].sequenceNumber + 1 : 1;
    const paddedSequence = String(nextSequence).padStart(4, '0');
    
    // Generate the booking ID
    const bookingId = `RHB-${serviceType}-${datePart}-${paddedSequence}`;
    
    // Save booking record (in production, this would be a database insert)
    const bookingRecord: BookingRecord = {
      bookingId,
      sequenceNumber: nextSequence,
      datePart,
      serviceType,
      timestamp: new Date()
    };
    
    bookingStorage.push(bookingRecord);
    
    console.log(`Generated booking ID: ${bookingId} (sequence: ${nextSequence} for ${datePart})`);
    
    return bookingId;
    
  } catch (error) {
    console.error('Error generating sequential booking ID:', error);
    // Fallback to timestamp-based ID if sequential generation fails
    const fallbackId = `RHB-${serviceType}-${Date.now()}-FALLBACK`;
    console.warn(`Using fallback ID: ${fallbackId}`);
    return fallbackId;
  }
}

/**
 * Get booking statistics for today (useful for monitoring)
 */
function getTodaysBookingStats(serviceType?: string) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todaysBookings = bookingStorage.filter(record => 
    record.datePart === today && 
    (serviceType ? record.serviceType === serviceType : true)
  );
  
  return {
    date: today,
    totalBookings: todaysBookings.length,
    serviceBreakdown: bookingStorage
      .filter(record => record.datePart === today)
      .reduce((acc, record) => {
        acc[record.serviceType] = (acc[record.serviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    lastBookingId: todaysBookings.length > 0 ? 
      todaysBookings.sort((a, b) => b.sequenceNumber - a.sequenceNumber)[0].bookingId : 
      null
  };
}

/**
 * Test function to simulate concurrent bookings and verify uniqueness
 * @param serviceType Service type to test
 * @param count Number of concurrent bookings to simulate
 */
export async function testConcurrentBookings(serviceType: string = 'HTL', count: number = 10) {
  console.log(`Testing ${count} concurrent ${serviceType} bookings...`);
  
  const startTime = Date.now();
  
  // Simulate concurrent booking requests
  const bookingPromises = Array.from({ length: count }, (_, index) => 
    generateSequentialRequestId(serviceType).then(id => ({
      id,
      requestIndex: index,
      timestamp: new Date()
    }))
  );
  
  const results = await Promise.all(bookingPromises);
  const endTime = Date.now();
  
  // Verify uniqueness
  const ids = results.map(r => r.id);
  const uniqueIds = new Set(ids);
  const hasDuplicates = uniqueIds.size !== ids.length;
  
  console.log('Concurrent booking test results:', {
    requestedCount: count,
    generatedCount: results.length,
    uniqueIds: uniqueIds.size,
    hasDuplicates,
    duration: `${endTime - startTime}ms`,
    sampleIds: results.slice(0, 5).map(r => r.id),
    stats: getTodaysBookingStats(serviceType)
  });
  
  if (hasDuplicates) {
    console.error('❌ DUPLICATE IDS DETECTED!', {
      duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)
    });
  } else {
    console.log('✅ All booking IDs are unique');
  }
  
  return {
    success: !hasDuplicates,
    results,
    stats: getTodaysBookingStats(serviceType)
  };
}

// Export utilities for external use
export const BookingIdGenerator = {
  generate: generateSequentialRequestId,
  getStats: getTodaysBookingStats,
  testConcurrent: testConcurrentBookings
};

// Log booking system initialization
console.log('🎯 Sequential Booking ID System Initialized');
console.log('Format: RHB-[SERVICE]-YYYYMMDD-####');
console.log('Services: HTL (Hotels), FLT (Flights), PKG (Packages)');
console.log('Daily reset: Sequence starts at 0001 each day (UTC)');

// Demo: Generate a few sample IDs to show the system working
(async () => {
  try {
    console.log('\n📋 Demo: Generating sample booking IDs...');
    
    // Generate sample hotel bookings
    const hotelId1 = await generateSequentialRequestId('HTL');
    const hotelId2 = await generateSequentialRequestId('HTL');
    
    // Generate sample flight booking (for future use)
    const flightId1 = await generateSequentialRequestId('FLT');
    
    console.log('Sample IDs generated:', {
      hotel1: hotelId1,
      hotel2: hotelId2,
      flight1: flightId1,
      todayStats: getTodaysBookingStats()
    });
  } catch (error) {
    console.log('Demo booking ID generation skipped:', error);
  }
})();

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
      // Generate professional sequential booking ID
      const inquiryId = await generateSequentialRequestId('HTL');
      
      console.log(`Processing hotel inquiry with ID: ${inquiryId}`);

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
        body: JSON.stringify({
          ...payload,
          bookingId: inquiryId, // Include the sequential booking ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      */

      // Simulated successful response with new ID format
      const result: HotelInquiryResponse = {
        id: inquiryId,
        status: 'received',
        message: 'Hotel inquiry received successfully'
      };

      console.log('Hotel inquiry submitted successfully:', result);
      
      // Log today's booking statistics for monitoring
      const stats = getTodaysBookingStats('HTL');
      console.log('Today\'s hotel booking stats:', stats);

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
      throw new Error(error instanceof Error ? error.message : 'Failed to submit hotel inquiry');
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