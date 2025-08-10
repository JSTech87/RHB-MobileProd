import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Handle GET requests (health checks)
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Flight search service is running",
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Handle POST requests (log search request)
    if (req.method === "POST") {
      const body = await req.json()
      
      // Validate required fields
      const requiredFields = ["origin", "destination", "departure_date", "user_id"]
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Missing required fields: ${missingFields.join(", ")}`
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      // Log the search request
      console.log("Flight search request received:", {
        origin: body.origin,
        destination: body.destination,
        departure_date: body.departure_date,
        return_date: body.return_date,
        passengers: body.passengers,
        cabin_class: body.cabin_class,
        trip_type: body.trip_type,
        user_id: body.user_id,
        timestamp: new Date().toISOString()
      })

      // Generate a search ID
      const searchId = crypto.randomUUID()
      
      // Return success response
      // Note: In production, this would trigger an async job to fetch from Duffel
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            search_id: searchId,
            status: "logged",
            message: "Search request logged successfully",
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Method not allowed
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed"
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
        error: "Internal server error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
}) 