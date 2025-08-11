import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { DuffelClient, DuffelApiError, getAuthenticatedUser } from "../_shared/duffel-client.ts"

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Initialize Duffel client
    const duffelClient = new DuffelClient()

    // Handle GET requests (health checks)
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Flight search service is running",
          timestamp: new Date().toISOString(),
          version: "v1.0.0"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Handle POST requests (flight search)
    if (req.method === "POST") {
      const body = await req.json()
      
      // Get authenticated user (optional for search - not required)
      const authUserId = await getAuthenticatedUser(req)
      
      // Validate required fields for basic search
      const requiredFields = ["slices", "passengers"]
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Missing required fields: ${missingFields.join(", ")}`,
            required_format: {
              slices: [{ origin: "JFK", destination: "LAX", departure_date: "2024-12-25" }],
              passengers: [{ type: "adult" }],
              cabin_class: "economy", // optional
              max_connections: 1, // optional
              return_offers: true // optional
            }
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      // Validate slices format
      if (!Array.isArray(body.slices) || body.slices.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "slices must be a non-empty array"
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      // Validate each slice
      for (const slice of body.slices) {
        if (!slice.origin || !slice.destination || !slice.departure_date) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Each slice must have origin, destination, and departure_date"
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }
      }

      // Validate passengers format
      if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "passengers must be a non-empty array"
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      console.log("Processing flight search request:", {
        slices: body.slices,
        passengers: body.passengers,
        cabin_class: body.cabin_class,
        user_id: authUserId || 'anonymous',
        timestamp: new Date().toISOString()
      })

      try {
        // Search flights using Duffel API (works without authentication)
        const searchResult = await duffelClient.searchFlights({
          slices: body.slices,
          passengers: body.passengers,
          cabin_class: body.cabin_class || 'economy',
          max_connections: body.max_connections || 1,
          supplier_timeout: body.supplier_timeout || 20000,
          return_offers: body.return_offers ?? true
        }, authUserId || undefined)

        console.log(`Flight search completed: ${searchResult.offers?.length || 0} offers found`)

        return new Response(
          JSON.stringify({
            success: true,
            data: searchResult,
            metadata: {
              search_timestamp: new Date().toISOString(),
              offers_count: searchResult.offers?.length || 0,
              search_duration_ms: searchResult.metadata?.search_duration_ms,
              authenticated: !!authUserId
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      } catch (searchError) {
        console.error("Flight search failed:", searchError)

        if (searchError instanceof DuffelApiError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: searchError.message,
              code: searchError.code,
              status: searchError.status,
              details: searchError.errors
            }),
            { 
              status: searchError.status || 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: "Flight search service temporarily unavailable",
            message: "Please try again later"
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
    }

    // Method not allowed
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
        allowed_methods: ["GET", "POST", "OPTIONS"]
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error("Error processing request:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
}) 