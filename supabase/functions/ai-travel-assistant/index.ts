import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 30 messages per hour
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: rateLimitResult } = await supabaseService
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_function_name: 'ai-travel-assistant',
        p_max_requests: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW
      });

    if (rateLimitResult?.[0] && !rateLimitResult[0].allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', reset_at: rateLimitResult[0].reset_at }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, conversationId, context } = await req.json();

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch user's recent missions
    const { data: recentMissions } = await supabase
      .from('user_missions')
      .select('*, mission:missions(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch favorite places
    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('*, place:places(*)')
      .eq('user_id', user.id)
      .limit(10);

    const systemPrompt = `You are a friendly, knowledgeable AI travel companion for TravelTacTix. Your name is Tix.

USER PROFILE:
- Name: ${profile?.full_name || 'Traveler'}
- Level: ${profile?.level || 1}
- Total XP: ${profile?.total_xp || 0}

RECENT MISSIONS:
${recentMissions?.map(m => `- ${m.mission?.title} (${m.is_completed ? 'Completed' : 'In Progress'})`).join('\n') || 'No recent missions'}

FAVORITE PLACES:
${favorites?.map(f => `- ${f.place?.name} in ${f.place?.city}`).join('\n') || 'No favorites yet'}

ADDITIONAL CONTEXT:
${context ? JSON.stringify(context) : 'None'}

YOUR CAPABILITIES:
1. Recommend destinations based on user preferences
2. Suggest missions and activities
3. Provide cultural tips and local insights
4. Help plan itineraries
5. Answer travel-related questions
6. Share hidden gems and offbeat experiences

GUIDELINES:
- Be enthusiastic but not overwhelming
- Personalize recommendations based on user's profile and history
- Suggest missions to earn XP when relevant
- Keep responses concise but helpful
- Use emojis sparingly to add personality
- If asked about bookings/payments, explain you can only recommend, not book`;

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
          ...messages
        ],
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error("Error in ai-travel-assistant:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
