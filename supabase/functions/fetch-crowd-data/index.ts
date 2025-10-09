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
    const { placeId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch place details from our database
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .single();

    if (placeError || !place) {
      console.error('Place fetch error:', placeError);
      return new Response(
        JSON.stringify({ error: 'Place not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Gemini AI to analyze and predict crowd data
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    console.log(`Analyzing crowd for: ${place.name} in ${place.city}`);
    
    const aiPrompt = `You are a crowd analytics expert. Analyze the following tourist attraction and provide realistic crowd predictions.

Place: ${place.name}
City: ${place.city}
Category: ${place.category}
Current Time: ${hour}:00 on ${dayName}

Based on this information, provide:
1. Current crowd percentage (0-100)
2. Crowd status (low/medium/high)
3. Best times to visit for each day of the week

Consider:
- Time of day (early morning is quieter, lunch/afternoon peaks, evening tapers off)
- Day of week (weekends are busier)
- Place category (temples busy on weekends, restaurants busy at meal times, etc.)
- Seasonal tourist patterns

Return ONLY valid JSON in this exact format:
{
  "crowd_percentage": <number between 5-95>,
  "crowd_status": "<low|medium|high>",
  "best_visit_times": [
    {"day": "Monday", "hours": "9:00-11:00", "crowd_level": "low"},
    {"day": "Tuesday", "hours": "9:00-11:00", "crowd_level": "low"},
    {"day": "Wednesday", "hours": "10:00-12:00", "crowd_level": "low"},
    {"day": "Thursday", "hours": "14:00-16:00", "crowd_level": "medium"},
    {"day": "Friday", "hours": "9:00-11:00", "crowd_level": "medium"},
    {"day": "Saturday", "hours": "7:00-9:00", "crowd_level": "medium"},
    {"day": "Sunday", "hours": "7:00-9:00", "crowd_level": "medium"}
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
          { role: 'system', content: 'You are a crowd analytics expert. Always return valid JSON only, no markdown or extra text.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);
    
    // Parse AI response
    let crowdData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '').trim();
      crowdData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    const { crowd_percentage, crowd_status, best_visit_times } = crowdData;

    // Update place in database
    const { error: updateError } = await supabase
      .from('places')
      .update({
        crowd_status: crowd_status,
        crowd_percentage: crowd_percentage,
        best_visit_times: best_visit_times,
        last_crowd_update: new Date().toISOString()
      })
      .eq('id', placeId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    console.log(`Updated ${place.name}: ${crowd_status} (${crowd_percentage}%)`);

    return new Response(
      JSON.stringify({
        crowd_status: crowd_status,
        crowd_percentage: crowd_percentage,
        best_visit_times: best_visit_times,
        last_updated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-crowd-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
