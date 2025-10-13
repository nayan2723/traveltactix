import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { place_query } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !PERPLEXITY_API_KEY) {
      throw new Error('API keys not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Search for the place in database - try name first, then city
    let { data: places } = await supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${place_query}%,city.ilike.%${place_query}%`)
      .limit(5);

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ error: `No places found for "${place_query}". Try searching for cities like Paris, Tokyo, Mumbai, or famous landmarks.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the first result as target
    const targetPlace = places[0];

    console.log(`Found target place: ${targetPlace.name} in ${targetPlace.city}`);

    // Fetch crowd data for target place
    const { data: crowdData } = await supabase.functions.invoke('fetch-crowd-data', {
      body: { placeId: targetPlace.id }
    });

    // Get real-time crowd trends from Perplexity
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a real-time travel expert specializing in crowd analytics and location recommendations.'
          },
          {
            role: 'user',
            content: `Find places similar to ${targetPlace.name} in ${targetPlace.city}, ${targetPlace.country}. Consider category (${targetPlace.category}), mood, and nearby attractions. Provide current crowd conditions.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    let realtimeTrends = '';
    if (perplexityResponse.ok) {
      const perplexityData = await perplexityResponse.json();
      realtimeTrends = perplexityData.choices[0].message.content;
    }

    // Get all places in the same city for similarity matching
    const { data: allPlaces } = await supabase
      .from('places')
      .select('*')
      .eq('city', targetPlace.city)
      .neq('id', targetPlace.id);
    // Get best months to visit using Gemini
    const monthsPrompt = `You are a travel timing expert. For ${targetPlace.name} in ${targetPlace.city}, ${targetPlace.country}, provide:

1. Best 3 months to visit with less crowd and good weather
2. Months to avoid due to high crowds or bad weather
3. Brief reason for each recommendation

Return ONLY valid JSON:
{
  "best_months": [
    {"month": "Month name", "reason": "Brief reason", "crowd_level": "low|medium"}
  ],
  "avoid_months": [
    {"month": "Month name", "reason": "Brief reason"}
  ]
}`;

    const monthsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a travel timing expert. Always return valid JSON only.' },
          { role: 'user', content: monthsPrompt }
        ],
      }),
    });

    let bestMonths = [];
    let avoidMonths = [];
    if (monthsResponse.ok) {
      const monthsData = await monthsResponse.json();
      const cleanMonths = monthsData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsedMonths = JSON.parse(cleanMonths);
      bestMonths = parsedMonths.best_months || [];
      avoidMonths = parsedMonths.avoid_months || [];
    }

    // Use Gemini to find similar places based on characteristics
    const similarityPrompt = `You are a location similarity expert with real-time data access.

Target Place:
- Name: ${targetPlace.name}
- City: ${targetPlace.city}
- Category: ${targetPlace.category}
- Description: ${targetPlace.description}
- Current Crowd: ${crowdData?.crowd_status || 'medium'} (${crowdData?.crowd_percentage || 50}%)

Real-time Context:
${realtimeTrends}

Available Places in ${targetPlace.city}:
${JSON.stringify(allPlaces?.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  crowd_percentage: p.crowd_percentage,
  crowd_status: p.crowd_status,
  description: p.description
})))}

Find the TOP 5 most similar places based on:
1. Category similarity
2. Experience type (cultural, scenic, historic, etc.)
3. Visitor profile and atmosphere
4. Location proximity
5. Current crowd levels

Return ONLY valid JSON:
{
  "similar_places": [
    {
      "place_id": "<uuid>",
      "name": "Place Name",
      "similarity_reason": "Brief reason for similarity"
    }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a location similarity expert. Always return valid JSON only.' },
          { role: 'user', content: similarityPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate similar places');
    }

    const aiData = await aiResponse.json();
    const cleanContent = aiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
    const similarPlaces = JSON.parse(cleanContent);

    // Fetch detailed crowd data for similar places
    const similarPlacesWithCrowd = await Promise.all(
      similarPlaces.similar_places.slice(0, 5).map(async (sp: any) => {
        const place = allPlaces?.find(p => p.id === sp.place_id);
        if (!place) return null;

        // Fetch crowd data
        await supabase.functions.invoke('fetch-crowd-data', {
          body: { placeId: place.id }
        });

        // Get updated place data
        const { data: updatedPlace } = await supabase
          .from('places')
          .select('*')
          .eq('id', place.id)
          .single();

        return {
          place_id: place.id,
          name: place.name,
          city: place.city,
          crowd_percentage: updatedPlace?.crowd_percentage || 50,
          crowd_status: updatedPlace?.crowd_status || 'medium',
          best_visit_times: updatedPlace?.best_visit_times || []
        };
      })
    );

    return new Response(
      JSON.stringify({
        target_place: {
          place_id: targetPlace.id,
          name: targetPlace.name,
          city: targetPlace.city,
          crowd_percentage: crowdData?.crowd_percentage || targetPlace.crowd_percentage || 50,
          crowd_status: crowdData?.crowd_status || targetPlace.crowd_status || 'medium',
          best_visit_times: crowdData?.best_visit_times || targetPlace.best_visit_times || [],
          best_months: bestMonths,
          avoid_months: avoidMonths,
          is_target: true
        },
        similar_places: similarPlacesWithCrowd.filter(p => p !== null)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in crowd-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});