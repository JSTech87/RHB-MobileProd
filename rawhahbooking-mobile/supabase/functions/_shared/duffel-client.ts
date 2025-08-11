import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Types
export interface SearchFlightParams {
  slices: Array<{
    origin: string
    destination: string
    departure_date: string
    departure_time?: { from: string; to: string }
    arrival_time?: { from: string; to: string }
  }>
  passengers: Array<{
    type?: 'adult' | 'child' | 'infant_without_seat'
    age?: number
    given_name?: string
    family_name?: string
    loyalty_programme_accounts?: Array<{
      airline_iata_code: string
      account_number: string
    }>
  }>
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first'
  max_connections?: number
  private_fares?: Record<string, any>
  return_offers?: boolean
  supplier_timeout?: number
}

export interface CreateCustomerUserParams {
  email: string
  given_name: string
  family_name: string
  phone_number?: string
  group_id?: string
}

export interface CreateOrderParams {
  selected_offers: Array<string>
  passengers: Array<{
    id?: string
    title?: string
    given_name: string
    family_name: string
    born_on: string
    email: string
    phone_number?: string
    gender?: string
    loyalty_programme_accounts?: Array<{
      airline_iata_code: string
      account_number: string
    }>
  }>
  payments: Array<{
    type: 'balance'
    amount: string
    currency: string
  }>
  services?: Array<{
    id: string
    quantity: number
  }>
}

export class DuffelApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public errors?: any[]
  ) {
    super(message)
    this.name = 'DuffelApiError'
  }
}

export class DuffelClient {
  private token: string
  private supabase: any

  constructor() {
    const token = Deno.env.get('DUFFEL_API_TOKEN')
    if (!token) {
      throw new Error('DUFFEL_API_TOKEN environment variable is required')
    }
    
    this.token = token
    console.log('🔑 Initialized Duffel client with token:', token.substring(0, 15) + '...')

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey)
    }
  }

  // Direct Duffel API call using fetch
  private async duffelFetch(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.duffel.com${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
        ...(options.headers || {})
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Duffel API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      })
      throw new DuffelApiError(
        data?.errors?.[0]?.message || `Duffel API error: ${response.status}`,
        response.status,
        data?.errors?.[0]?.code,
        data?.errors
      )
    }

    return data
  }

  // Flight Search with direct API calls
  async searchFlights(params: SearchFlightParams, authUserId?: string) {
    try {
      const startTime = Date.now()
      
      // Apply Duffel best practices
      const searchParams = {
        ...params,
        // Default to 1 connection max for better performance
        max_connections: params.max_connections ?? 1,
        // Set reasonable timeout (20 seconds default)
        supplier_timeout: params.supplier_timeout ?? 20000,
        // Return offers immediately if not specified
        return_offers: params.return_offers ?? true,
      }

      console.log('🔍 Searching flights with params:', JSON.stringify(searchParams, null, 2))

      const data = await this.duffelFetch('/air/offer_requests', {
        method: 'POST',
        body: JSON.stringify({ data: searchParams })
      })
      
      const duration = Date.now() - startTime

      // Log search to database if Supabase is available
      if (this.supabase && authUserId) {
        try {
          await this.supabase
            .from('search_history')
            .insert({
              auth_user_id: authUserId,
              search_params: searchParams,
              results_count: data.data?.offers?.length || 0,
              search_duration_ms: duration
            })
        } catch (dbError) {
          console.warn('Failed to log search history:', dbError)
        }
      }

      console.log(`✅ Flight search completed: ${data.data?.offers?.length || 0} offers found in ${duration}ms`)

      return {
        offers: data.data?.offers || [],
        request_id: data.data?.id,
        passengers: data.data?.passengers,
        slices: data.data?.slices,
        metadata: {
          search_duration_ms: duration,
          results_count: data.data?.offers?.length || 0
        }
      }
    } catch (error) {
      console.error('Flight search error:', error)
      
      if (error instanceof DuffelApiError) {
        throw error
      }
      
      throw new DuffelApiError('Failed to search flights: ' + error.message)
    }
  }

  // Get specific offer using direct API
  async getOffer(offerId: string) {
    try {
      const data = await this.duffelFetch(`/air/offers/${offerId}`)
      return data.data
    } catch (error) {
      console.error('Get offer error:', error)
      throw new DuffelApiError('Failed to get offer: ' + error.message)
    }
  }

  // Search airports using direct API
  async searchAirports(query: string, limit: number = 10) {
    try {
      let searchUrl = `/air/airports?limit=${limit}`
      
      // Try different search strategies based on query length
      if (query.length === 3) {
        // Likely IATA code
        searchUrl += `&filter[iata_code]=${query.toUpperCase()}`
      } else {
        // Search by name or city
        searchUrl += `&filter[name]=${encodeURIComponent(query)}`
      }

      console.log('🏝️ Searching airports:', searchUrl)
      
      const data = await this.duffelFetch(searchUrl)

      const airports = data.data.map((airport: any) => ({
        iata_code: airport.iata_code,
        name: airport.name,
        city_name: airport.city?.name || airport.name,
        iata_country_code: airport.iata_country_code
      }))

      console.log(`🏝️ Found ${airports.length} airports for "${query}"`)
      return airports
    } catch (error) {
      console.error('Airport search error:', error)
      throw new DuffelApiError('Failed to search airports: ' + error.message)
    }
  }

  // Create customer user
  async createCustomerUser(params: CreateCustomerUserParams, authUserId?: string) {
    try {
      // Create in Duffel
      const duffelUser = await this.duffelFetch('/customer_users', {
        method: 'POST',
        body: JSON.stringify({ data: params })
      })
      
      // Store in database if Supabase is available
      if (this.supabase && authUserId) {
        const { data, error } = await this.supabase
          .from('customer_users')
          .insert({
            duffel_id: duffelUser.data.id,
            email: params.email,
            given_name: params.given_name,
            family_name: params.family_name,
            phone_number: params.phone_number,
            group_id: params.group_id,
            auth_user_id: authUserId
          })
          .select()
          .single()

        if (error) {
          console.error('Database error storing customer user:', error)
          // Continue without failing - Duffel user was created successfully
        }

        return { duffelUser: duffelUser.data, dbUser: data }
      }

      return { duffelUser: duffelUser.data, dbUser: null }
    } catch (error) {
      console.error('Create customer user error:', error)
      throw new DuffelApiError('Failed to create customer user: ' + error.message)
    }
  }

  // Create order
  async createOrder(params: CreateOrderParams, authUserId?: string) {
    try {
      const order = await this.duffelFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ data: params })
      })
      
      // Store in database if Supabase is available
      if (this.supabase && authUserId) {
        try {
          await this.supabase
            .from('flight_orders')
            .insert({
              duffel_order_id: order.data.id,
              booking_reference: order.data.booking_reference,
              auth_user_id: authUserId,
              total_amount: parseFloat(order.data.total_amount),
              total_currency: order.data.total_currency,
              status: order.data.status,
              live_mode: order.data.live_mode,
              passenger_data: params.passengers,
              offer_data: params.selected_offers,
              metadata: {
                created_via: 'mobile_app',
                duffel_order_data: order.data
              }
            })
        } catch (dbError) {
          console.error('Failed to store order in database:', dbError)
          // Continue without failing - order was created in Duffel
        }
      }

      return order.data
    } catch (error) {
      console.error('Create order error:', error)
      
      if (error instanceof DuffelApiError) {
        throw error
      }
      
      throw new DuffelApiError('Failed to create order: ' + error.message)
    }
  }

  // Get seat maps
  async getSeatMaps(offerId: string) {
    try {
      const seatMaps = await this.duffelFetch(`/air/seat_maps?offer_id=${offerId}`)

      // Transform for easier frontend consumption
      return seatMaps.data.map((map: any) => ({
        id: map.id,
        segment_id: map.segment_id,
        slice_id: map.slice_id,
        cabins: map.cabins?.map((cabin: any) => ({
          cabin_class: cabin.cabin_class,
          deck: cabin.deck,
          aisles: cabin.aisles,
          wings: cabin.wings,
          rows: this.transformSeatMapRows(cabin.rows)
        })) || []
      }))
    } catch (error) {
      console.error('Get seat maps error:', error)
      throw new DuffelApiError('Failed to get seat maps: ' + error.message)
    }
  }

  private transformSeatMapRows(rows: any[]) {
    return rows?.map(row => ({
      sections: row.sections?.map((section: any) => ({
        elements: section.elements?.map((element: any) => {
          if (element.type === 'seat') {
            const availableService = element.available_services?.[0]
            return {
              ...element,
              available: element.available_services?.length > 0,
              price: availableService?.total_amount || '0',
              currency: availableService?.total_currency || 'USD',
              service_id: availableService?.id
            }
          }
          return element
        }) || []
      })) || []
    })) || []
  }

  // Get user's customer profile from database
  async getCustomerUser(authUserId: string) {
    if (!this.supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await this.supabase
      .from('customer_users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error('Failed to get customer user: ' + error.message)
    }

    return data
  }

  // Get user's orders from database
  async getUserOrders(authUserId: string) {
    if (!this.supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await this.supabase
      .from('flight_orders')
      .select('*')
      .eq('auth_user_id', authUserId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to get user orders: ' + error.message)
    }

    return data
  }
}

// Helper function to get authenticated user from request
export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  // In a real implementation, you'd verify the JWT token
  // For now, we'll extract it from the header
  const token = authHeader.substring(7)
  
  // You could use Supabase to verify the token:
  // const supabase = createClient(supabaseUrl, supabaseAnonKey)
  // const { data: { user }, error } = await supabase.auth.getUser(token)
  
  return token // Return the token or user ID
} 