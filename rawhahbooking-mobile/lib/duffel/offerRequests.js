// Compatibility wrapper for legacy imports
import DuffelApiService from '../../services/duffelApi';

export const createOfferRequest = async (searchParams) => {
  try {
    // Convert old format to new Duffel API format
    const slices = [
      {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departure_date: searchParams.departureDate,
      },
    ];

    if (searchParams.returnDate) {
      slices.push({
        origin: searchParams.destination,
        destination: searchParams.origin,
        departure_date: searchParams.returnDate,
      });
    }

    const request = {
      cabin_class: searchParams.cabinClass,
      passengers: searchParams.passengers,
      slices,
      max_connections: searchParams.maxConnections || 2,
    };

    const response = await DuffelApiService.searchOffers(request);
    
    // Return in old format for compatibility
    return {
      success: true,
      offers: response.data,
      offerRequestId: 'legacy-' + Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Search failed',
      offers: [],
    };
  }
};

// Advanced Search with Filters
export async function createAdvancedOfferRequest(searchParams) {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass = 'economy',
      maxConnections = 1,
      departureTimeRange,
      arrivalTimeRange,
      privateFares,
      supplierTimeout = 20000
    } = searchParams

    const slices = [{
      origin,
      destination,
      departure_date: departureDate,
      ...(departureTimeRange && { departure_time: departureTimeRange }),
      ...(arrivalTimeRange && { arrival_time: arrivalTimeRange })
    }]

    if (returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate
      })
    }

    const requestBody = {
      slices,
      passengers: passengers.map(p => ({ 
        type: p.type,
        ...(p.age && { age: p.age }),
        ...(p.fareType && { fare_type: p.fareType })
      })),
      cabin_class: cabinClass,
      max_connections: maxConnections,
      ...(privateFares && { private_fares: privateFares }),
      return_offers: true
    }

    const offerRequest = await duffel.offerRequests.create(requestBody, {
      supplier_timeout: supplierTimeout
    })

    return {
      success: true,
      offerRequestId: offerRequest.id,
      offers: offerRequest.offers || [],
      clientKey: offerRequest.client_key
    }
  } catch (error) {
    return handleDuffelError(error)
  }
}

// Search Best Practices Implementation
export const SEARCH_FILTERS = {
  cabinClass: ['economy', 'premium_economy', 'business', 'first'],
  maxConnections: [0, 1, 2], // 0 = direct, 1 = 1 stop, etc.
  timeRanges: {
    morning: { from: '06:00', to: '12:00' },
    afternoon: { from: '12:00', to: '18:00' },
    evening: { from: '18:00', to: '24:00' },
    night: { from: '00:00', to: '06:00' }
  }
}

export function optimizeSearchParams(params) {
  return {
    ...params,
    // Always set max_connections for performance
    max_connections: params.max_connections ?? 1,
    // Default cabin class
    cabin_class: params.cabin_class || 'economy',
    // Optimize supplier timeout based on search type
    supplier_timeout: params.direct_only ? 10000 : 20000
  }
} 