// Phase 1: Core Duffel Setup & Search - Offers Management
import duffel from './client.js'
import { handleDuffelError } from './errorHandling.js'

// Retrieve Single Offer
export async function getSingleOffer(offerId) {
  try {
    const offer = await duffel.offers.get(offerId)
    return {
      success: true,
      offer: offer
    }
  } catch (error) {
    return handleDuffelError(error)
  }
}

export async function listOffers(offerRequestId, options = {}) {
  try {
    const {
      limit = 50,
      sort = 'total_amount',
      order = 'asc'
    } = options

    const offers = await duffel.offers.list({
      offer_request_id: offerRequestId,
      limit,
      sort: `${order === 'desc' ? '-' : ''}${sort}`
    })

    return {
      success: true,
      offers: offers.data,
      meta: offers.meta
    }
  } catch (error) {
    return handleDuffelError(error)
  }
} 