// Compatibility wrapper for legacy imports
import DuffelApiService from '../../services/duffelApi';

export const testDuffelConnection = async () => {
  try {
    const isConnected = await DuffelApiService.ping();
    return {
      success: isConnected,
      error: isConnected ? null : 'Connection failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Connection test failed',
    };
  }
};

// Legacy default export
const duffel = {
  // Mock client for compatibility
  airports: {
    search: async (query) => {
      const response = await DuffelApiService.searchAirports(query);
      return response.data;
    }
  },
  offerRequests: {
    create: async (params) => {
      const response = await DuffelApiService.searchOffers(params);
      return {
        id: 'legacy-' + Date.now(),
        offers: response.data,
        client_key: 'legacy-key',
      };
    }
  }
};

export default duffel; 