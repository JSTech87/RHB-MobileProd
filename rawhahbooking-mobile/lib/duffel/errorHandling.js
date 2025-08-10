// Phase 1: Core Duffel Setup & Search - Error Handling Utility
export function handleDuffelError(error) {
  const errorMap = {
    'validation_error': 'Invalid search parameters provided',
    'authentication_error': 'API authentication failed',
    'rate_limit_error': 'Too many requests, please try again later',
    'api_error': 'Service temporarily unavailable',
    'network_error': 'Connection error, please check your internet'
  }

  return {
    success: false,
    error: errorMap[error.type] || error.message || 'Unknown error occurred',
    type: error.type || 'unknown_error',
    details: error.errors || null
  }
} 