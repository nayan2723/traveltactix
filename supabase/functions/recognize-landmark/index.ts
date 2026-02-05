import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum image size: 10MB (base64 encoded)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Input validation schema
const RequestSchema = z.object({
  imageData: z.string().min(50).refine(
    (data) => {
      // Validate base64 data URI format
      return data.startsWith('data:image/') && data.includes('base64,');
    },
    { message: 'Invalid image format' }
  ).refine(
    (data) => data.length <= MAX_IMAGE_SIZE,
    { message: 'Image too large (max 10MB)' }
  )
});

// Rate limit configuration: 15 requests per hour per user (image processing is expensive)
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 60; // minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract auth header for user identification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Create client with user's auth token to get user ID
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for rate limiting and data access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_function_name: 'recognize-landmark',
        p_max_requests: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (rateLimitResult && rateLimitResult.length > 0 && !rateLimitResult[0].allowed) {
      const resetAt = new Date(rateLimitResult[0].reset_at);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: `You've used ${rateLimitResult[0].current_count}/${rateLimitResult[0].max_allowed} requests. Try again after ${resetAt.toLocaleTimeString()}.`,
          reset_at: rateLimitResult[0].reset_at,
          success: false
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult[0].reset_at
          } 
        }
      );
    }

    // Validate input
    const body = await req.json();
    const validated = RequestSchema.parse(body);
    const { imageData } = validated;

    // Use Lovable AI with Gemini vision to identify the landmark
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and identify if it contains a famous landmark, monument, tourist attraction, or recognizable place. 
                
                Provide a JSON response with:
                - name: The name of the landmark/place
                - city: The city where it's located
                - country: The country where it's located
                - description: A detailed 3-4 sentence description about the landmark's history, architecture, and cultural significance
                - category: Type of place (monument, temple, museum, park, etc.)
                - confidence: Your confidence level (high/medium/low)
                - latitude: Approximate latitude (if known)
                - longitude: Approximate longitude (if known)
                - famousFoods: Array of 3-5 famous local dishes/foods from this area (with name and brief description)
                - culturalFacts: Array of 3-5 interesting cultural facts about the area
                - nearbyAttractions: Array of 3-5 other famous places or attractions in the same city
                - bestTimeToVisit: Best time of day or season to visit
                
                If you cannot identify a clear landmark, set confidence to "low" and provide your best guess or say "unidentified".
                
                Example format for famousFoods:
                [{"name": "Dish Name", "description": "Brief description of the dish"}]
                
                Example for culturalFacts:
                ["Interesting fact 1", "Interesting fact 2"]
                
                Example for nearbyAttractions:
                [{"name": "Place Name", "distance": "2km away", "type": "museum"}]`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", success: false }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue.", success: false }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No response from AI");
    }

    const landmarkInfo = JSON.parse(aiContent);

    // Search for matching places in the database
    let matchedPlace = null;
    let nearbyPlaces = [];

    if (landmarkInfo.confidence !== "low" && landmarkInfo.name !== "unidentified") {
      // Try to find matching place in database
      const { data: places, error: placesError } = await supabase
        .from('places')
        .select('*')
        .ilike('name', `%${landmarkInfo.name}%`)
        .limit(1);

      if (!placesError && places && places.length > 0) {
        matchedPlace = places[0];
        
        // Get nearby places if we have coordinates
        if (matchedPlace.latitude && matchedPlace.longitude) {
          const { data: nearby } = await supabase
            .from('places')
            .select('*')
            .neq('id', matchedPlace.id)
            .eq('city', matchedPlace.city)
            .limit(5);
          
          if (nearby) {
            nearbyPlaces = nearby;
          }
        }
      } else {
        // Search by city and country
        const { data: cityPlaces } = await supabase
          .from('places')
          .select('*')
          .eq('city', landmarkInfo.city)
          .eq('country', landmarkInfo.country)
          .limit(5);
        
        if (cityPlaces) {
          nearbyPlaces = cityPlaces;
        }
      }
    }

    // Get AR hotspot data if available
    const { data: arHotspot } = await supabase
      .from('ar_hotspots')
      .select('*')
      .eq('city', landmarkInfo.city)
      .eq('is_active', true)
      .limit(1)
      .single();

    // Include rate limit info in response headers
    const remaining = rateLimitResult?.[0] ? RATE_LIMIT_MAX - rateLimitResult[0].current_count : RATE_LIMIT_MAX;

    return new Response(
      JSON.stringify({
        success: true,
        landmark: landmarkInfo,
        matchedPlace,
        nearbyPlaces,
        arHotspot,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        } 
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          success: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error("Error in recognize-landmark");
    return new Response(
      JSON.stringify({ 
        error: "Failed to recognize landmark",
        success: false
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
