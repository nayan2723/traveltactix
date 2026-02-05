import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const RequestSchema = z.object({
  preferences: z.record(z.any()).optional()
});

// Rate limit configuration: 15 requests per hour per user
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 60; // minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Create client with user's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for rate limiting
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const { data: rateLimitResult, error: rateLimitError } = await supabaseService
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_function_name: 'ai-recommendations',
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
          reset_at: rateLimitResult[0].reset_at
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

    // Validate request body
    const body = await req.json();
    const validated = RequestSchema.parse(body);
    const { preferences } = validated;
    
    // Get user's past visits and favorites (RLS enforced)
    const { data: visits } = await supabase
      .from('user_place_visits')
      .select('place_id, places(name, category, mood_tags)')
      .eq('user_id', user.id)
      .limit(10);

    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('place_id, places(name, category, mood_tags)')
      .eq('user_id', user.id)
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
      visitHistory: visits?.map(v => {
        const place = v.places as { name: string; category: string; mood_tags: string[] } | null;
        return {
          name: place?.name,
          category: place?.category,
          moods: place?.mood_tags
        };
      }) || [],
      favorites: favorites?.map(f => {
        const place = f.places as { name: string; category: string; mood_tags: string[] } | null;
        return {
          name: place?.name,
          category: place?.category,
          moods: place?.mood_tags
        };
      }) || [],
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

    // Include rate limit info in response headers
    const remaining = rateLimitResult?.[0] ? RATE_LIMIT_MAX - rateLimitResult[0].current_count : RATE_LIMIT_MAX;

    return new Response(
      JSON.stringify({ recommendations: enrichedRecommendations }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        } 
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error("Error in ai-recommendations");
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
