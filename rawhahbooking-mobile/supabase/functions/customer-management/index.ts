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
    
    // Get authenticated user
    const authUserId = await getAuthenticatedUser(req)
    if (!authUserId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
          message: "Please provide a valid authorization token"
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Handle GET requests (get customer profile)
    if (req.method === "GET") {
      try {
        const customerUser = await duffelClient.getCustomerUser(authUserId)
        
        if (!customerUser) {
          return new Response(
            JSON.stringify({
              success: true,
              data: null,
              message: "No customer profile found"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: customerUser
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      } catch (error) {
        console.error("Error getting customer profile:", error)
        
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to get customer profile"
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
    }

    // Handle POST requests (create customer profile)
    if (req.method === "POST") {
      const body = await req.json()
      
      // Validate required fields
      const requiredFields = ["email", "given_name", "family_name"]
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Missing required fields: ${missingFields.join(", ")}`,
            required_fields: requiredFields
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      try {
        console.log("Creating customer user for:", authUserId)
        
        const result = await duffelClient.createCustomerUser({
          email: body.email,
          given_name: body.given_name,
          family_name: body.family_name,
          phone_number: body.phone_number
        }, authUserId)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              duffel_user: result.duffelUser,
              db_user: result.dbUser
            },
            message: "Customer profile created successfully"
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )

      } catch (createError) {
        console.error("Error creating customer user:", createError)

        if (createError instanceof DuffelApiError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: createError.message,
              code: createError.code,
              details: createError.errors
            }),
            { 
              status: createError.status || 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to create customer profile"
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
    console.error("Error processing customer management request:", error)
    
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