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
    const { placeIds, days, preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get details for selected places
    const { data: places } = await supabase
      .from('places')
      .select('*')
      .in('id', placeIds);

    if (!places || places.length === 0) {
      throw new Error("No places found");
    }

    const systemPrompt = `You are an expert travel itinerary planner specializing in creating balanced, efficient travel schedules.

Places to include:
${JSON.stringify(places, null, 2)}

Trip duration: ${days} days
User preferences: ${JSON.stringify(preferences || {})}

Instructions:
1. Create a day-by-day itinerary for ${days} days
2. Include both offbeat destinations and popular spots for balance
3. Consider travel time between locations (group nearby places)
4. Include estimated visit times for each place
5. Add meal breaks and rest periods
6. Suggest morning/afternoon/evening activities based on place characteristics
7. Include cultural tips and practical advice

Return a JSON object with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "theme": "Cultural Immersion",
      "activities": [
        {
          "time": "9:00 AM",
          "place_id": "uuid",
          "place_name": "Place Name",
          "duration": 120,
          "description": "What to do here",
          "tips": ["tip 1", "tip 2"]
        }
      ]
    }
  ],
  "overview": "Brief trip summary",
  "tips": ["General tip 1", "General tip 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Create a ${days}-day itinerary including these places.` 
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log("AI Response received");

    // Parse AI response
    let itinerary;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      itinerary = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Failed to generate itinerary");
    }

    return new Response(
      JSON.stringify(itinerary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in ai-itinerary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
