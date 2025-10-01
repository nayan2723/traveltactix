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
    const { userId, preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's past visits and favorites
    const { data: visits } = await supabase
      .from('user_place_visits')
      .select('place_id, places(name, category, mood_tags)')
      .eq('user_id', userId)
      .limit(10);

    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('place_id, places(name, category, mood_tags)')
      .eq('user_id', userId)
      .limit(10);

    // Get all available places
    const { data: allPlaces } = await supabase
      .from('places')
      .select('*')
      .eq('is_hidden_gem', true);

    const visitedPlaceIds = new Set(visits?.map(v => v.place_id) || []);
    const availablePlaces = allPlaces?.filter(p => !visitedPlaceIds.has(p.id)) || [];

    // Build context for AI
    const userContext = {
      visitHistory: visits?.map(v => ({
        name: v.places?.name,
        category: v.places?.category,
        moods: v.places?.mood_tags
      })) || [],
      favorites: favorites?.map(f => ({
        name: f.places?.name,
        category: f.places?.category,
        moods: f.places?.mood_tags
      })) || [],
      preferences: preferences || {}
    };

    const systemPrompt = `You are an expert travel advisor specializing in offbeat and hidden gem destinations. 
Your task is to analyze the user's travel history and preferences to recommend 5 personalized destinations.

User's travel history and preferences:
${JSON.stringify(userContext, null, 2)}

Available destinations to choose from:
${JSON.stringify(availablePlaces.slice(0, 20), null, 2)}

Instructions:
1. Analyze the user's past visits and favorites to understand their travel style
2. Consider their stated preferences (moods, categories)
3. Recommend 5 destinations that match their style but offer new experiences
4. For each recommendation, provide:
   - place_id (from available destinations)
   - reason (brief explanation why this fits their profile)
   - match_score (0-100 based on how well it matches)
5. Prioritize hidden gems they haven't visited yet
6. Return ONLY a JSON array of recommendations, no other text`;

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
            content: "Generate personalized recommendations based on my profile." 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log("AI Response:", content);

    // Parse AI response
    let recommendations;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      recommendations = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback to random recommendations
      recommendations = availablePlaces.slice(0, 5).map(place => ({
        place_id: place.id,
        reason: "Based on your travel preferences",
        match_score: 75
      }));
    }

    // Enrich recommendations with full place data
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const place = availablePlaces.find(p => p.id === rec.place_id);
      return {
        ...place,
        recommendation_reason: rec.reason,
        match_score: rec.match_score
      };
    }).filter((r: any) => r.id); // Filter out any that didn't match

    console.log("Enriched recommendations:", enrichedRecommendations.length);

    return new Response(
      JSON.stringify({ recommendations: enrichedRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
