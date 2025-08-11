import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { DuffelClient, DuffelApiError } from "../_shared/duffel-client.ts"

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Initialize Duffel client
    const duffelClient = new DuffelClient()

    // Handle GET requests (airport search)
    if (req.method === "GET") {
      const url = new URL(req.url)
      const query = url.searchParams.get('q')
      const limit = parseInt(url.searchParams.get('limit') || '10')

      if (!query || query.length < 2) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Query parameter 'q' is required and must be at least 2 characters",
            example: "/airports?q=New York&limit=10"
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      try {
        console.log(`Searching airports for: "${query}"`)
        
        const airports = await duffelClient.searchAirports(query, limit)
        
        console.log(`Found ${airports.length} airports for query: "${query}"`)

        return new Response(
          JSON.stringify({
            success: true,
            data: airports,
            metadata: {
              query,
              results_count: airports.length,
              timestamp: new Date().toISOString()
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      } catch (searchError) {
        console.error("Airport search failed:", searchError)

        if (searchError instanceof DuffelApiError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: searchError.message,
              code: searchError.code
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
            error: "Airport search service temporarily unavailable"
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
        allowed_methods: ["GET", "OPTIONS"]
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error("Error processing airport search request:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
}) 