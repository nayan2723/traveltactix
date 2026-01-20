import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const RequestSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timeAvailable: z.number().min(10).max(480).optional()
});

// Rate limit configuration: 20 requests per hour per user
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60; // minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', recommendations: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', recommendations: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for rate limiting
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const { data: rateLimitResult, error: rateLimitError } = await supabaseService
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_function_name: 'recommend-missions',
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
          recommendations: []
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
    const { latitude, longitude, timeAvailable } = validated;

    // Get user profile and stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's mission history
    const { data: userMissions } = await supabase
      .from('user_missions')
      .select(`
        *,
        missions (*)
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20);

    // Get available missions
    const { data: availableMissions } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .gte('deadline', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Calculate user stats
    const completedMissions = userMissions?.filter(m => m.is_completed) || [];
    const completionRate = completedMissions.length > 0 
      ? (completedMissions.length / (userMissions?.length || 1)) * 100 
      : 0;

    const avgTimeSpent = completedMissions.length > 0
      ? completedMissions.reduce((sum, m) => sum + (m.time_spent_minutes || 60), 0) / completedMissions.length
      : 60;

    const preferredCategories = completedMissions
      .map(m => m.missions?.category)
      .filter(Boolean)
      .reduce((acc: any, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

    const topCategory = Object.keys(preferredCategories).sort(
      (a, b) => preferredCategories[b] - preferredCategories[a]
    )[0] || 'culture';

    // Build recommendation prompt
    const systemPrompt = `You are an AI mission recommender for TravelTacTix. Analyze user data and recommend the best missions.

User Profile:
- Level: ${profile?.level || 1}
- Total XP: ${profile?.total_xp || 0}
- Missions Completed: ${completedMissions.length}
- Completion Rate: ${completionRate.toFixed(1)}%
- Average Time per Mission: ${avgTimeSpent.toFixed(0)} minutes
- Preferred Category: ${topCategory}
- Time Available: ${timeAvailable || 'flexible'} minutes

Available Missions:
${JSON.stringify(availableMissions?.slice(0, 20), null, 2)}

Recommend 5 missions that are:
1. Appropriate for the user's level (level ${profile?.level || 1})
2. Match their interests (prefers ${topCategory})
3. Fit their available time (${timeAvailable || 'flexible'} minutes)
4. Have a good difficulty balance for their completion rate (${completionRate.toFixed(1)}%)
${latitude && longitude ? `5. Are reasonably close to their location (${latitude}, ${longitude})` : ''}

Return ONLY a JSON array of mission IDs with brief reasoning:
[
  {
    "mission_id": "uuid",
    "reason": "Why this mission is recommended (max 100 chars)",
    "fit_score": 0-100
  }
]`;

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
          { 
            role: 'user', 
            content: 'Based on my profile and history, what missions should I do next?' 
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', recommendations: [] }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse recommendations
    let recommendations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      recommendations = [];
    }

    // Enrich recommendations with full mission data
    const enrichedRecommendations = recommendations
      .map((rec: any) => {
        const mission = availableMissions?.find(m => m.id === rec.mission_id);
        return mission ? { ...rec, mission } : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // Include rate limit info in response headers
    const remaining = rateLimitResult?.[0] ? RATE_LIMIT_MAX - rateLimitResult[0].current_count : RATE_LIMIT_MAX;

    return new Response(
      JSON.stringify({ 
        recommendations: enrichedRecommendations,
        user_stats: {
          level: profile?.level || 1,
          completion_rate: completionRate,
          preferred_category: topCategory,
        }
      }),
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
        JSON.stringify({ error: 'Invalid input', recommendations: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error in recommend-missions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        recommendations: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
