import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, country } = await req.json();
    
    if (!city || !country) {
      return new Response(
        JSON.stringify({ error: 'City and country are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Fetch existing places for context
    const { data: places } = await supabase
      .from('places')
      .select('name, category, description')
      .eq('city', city)
      .eq('country', country)
      .limit(5);

    const placesContext = places && places.length > 0 
      ? `\n\nExisting places in this location: ${places.map(p => `${p.name} (${p.category})`).join(', ')}`
      : '';

    const systemPrompt = `You are a travel mission designer for TravelTacTix, specializing in creating engaging, culturally-rich missions for Indian destinations.

Generate 6-8 unique missions for ${city}, ${country}. Each mission should:
- Be authentic to Indian culture, traditions, and experiences
- Focus on local cuisine, heritage sites, festivals, art forms, markets, or unique activities
- Have varying difficulty levels (easy, medium, hard)
- Offer appropriate XP rewards (easy: 50-100 XP, medium: 100-200 XP, hard: 200-300 XP)
- Include realistic deadlines (3-14 days from now)
- Be specific and actionable

Categories to choose from: food, culture, adventure, photography, heritage, shopping, nature, spiritual

${placesContext}

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Mission title (max 60 chars)",
    "description": "Detailed description (max 200 chars)",
    "category": "category name",
    "difficulty": "easy|medium|hard",
    "xp_reward": number,
    "deadline_days": number (3-14)
  }
]`;

    console.log('Generating missions for:', city, country);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create exciting missions for travelers in ${city}, ${country}` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response
    let missions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      missions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      missions = [];
    }

    // Format missions with proper structure
    const formattedMissions = missions.map((mission: any) => {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (mission.deadline_days || 7));
      
      return {
        id: crypto.randomUUID(),
        title: mission.title,
        description: mission.description,
        category: mission.category,
        difficulty: mission.difficulty,
        xp_reward: mission.xp_reward,
        city,
        country,
        deadline: deadlineDate.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`Generated ${formattedMissions.length} missions`);

    return new Response(
      JSON.stringify({ missions: formattedMissions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-missions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        missions: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
