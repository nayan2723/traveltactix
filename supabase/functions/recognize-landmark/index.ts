import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error("No image data provided");
    }

    console.log("Analyzing landmark image...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use Lovable AI with Gemini vision to identify the landmark
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
                - description: A brief 2-3 sentence description
                - category: Type of place (monument, temple, museum, park, etc.)
                - confidence: Your confidence level (high/medium/low)
                - latitude: Approximate latitude (if known)
                - longitude: Approximate longitude (if known)
                
                If you cannot identify a clear landmark, set confidence to "low" and provide your best guess or say "unidentified".`
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
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
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

    console.log("AI Response:", aiContent);
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
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Error in recognize-landmark:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
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
