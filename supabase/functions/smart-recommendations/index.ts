import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const QuestionsSchema = z.object({
  mode: z.literal('questions')
});

const RecommendationsSchema = z.object({
  mode: z.literal('recommendations'),
  // Answers can be either an array of objects or a record (object with string keys/values)
  answers: z.union([
    z.array(z.object({
      question: z.string().max(500),
      answer: z.string().max(1000)
    })).max(20),
    z.record(z.string().max(1000))
  ])
});

// Rate limit configuration: 10 requests per hour per user (expensive due to Perplexity + Gemini)
const RATE_LIMIT_MAX = 10;
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

    const body = await req.json();
    const { mode } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
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
        p_function_name: 'smart-recommendations',
        p_max_requests: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW
      });

    if (rateLimitError) {
      // Silent fail for rate limit check - continue with request
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

    // Include rate limit info in response headers
    const remaining = rateLimitResult?.[0] ? RATE_LIMIT_MAX - rateLimitResult[0].current_count : RATE_LIMIT_MAX;
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
      'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    };

    // Mode 1: Generate personalized questions
    if (mode === 'questions') {
      // Validate schema
      QuestionsSchema.parse(body);
      
      const questionPrompt = `You are a travel advisor AI. Generate 5 personalized questions to understand a traveler's preferences.
      
Questions should cover:
1. Travel style (adventure, relaxation, culture, food)
2. Budget preference (budget, moderate, luxury)
3. Crowd tolerance (busy tourist spots vs hidden gems)
4. Activity level (active exploration vs leisurely)
5. Cultural interests (history, art, local experiences, nature)

Return ONLY a JSON array of question objects with this exact structure:
[
  {
    "id": "q1",
    "question": "question text",
    "type": "multiple_choice",
    "options": ["option1", "option2", "option3", "option4"]
  }
]

Make questions engaging, specific, and helpful for understanding travel preferences.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: questionPrompt },
            { role: "user", content: "Generate 5 travel preference questions." }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      let questions;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        questions = JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Fallback questions
        questions = [
          {
            id: "q1",
            question: "What type of travel experience do you prefer?",
            type: "multiple_choice",
            options: ["Adventure & Exploration", "Cultural Immersion", "Relaxation & Leisure", "Food & Culinary"]
          },
          {
            id: "q2",
            question: "What's your ideal travel pace?",
            type: "multiple_choice",
            options: ["Packed itinerary", "Balanced schedule", "Slow travel", "Go with the flow"]
          },
          {
            id: "q3",
            question: "How do you feel about crowds?",
            type: "multiple_choice",
            options: ["Love popular attractions", "Some crowds okay", "Prefer quiet places", "Hidden gems only"]
          },
          {
            id: "q4",
            question: "What's your budget preference?",
            type: "multiple_choice",
            options: ["Budget-friendly", "Moderate spending", "Comfortable budget", "Luxury experiences"]
          },
          {
            id: "q5",
            question: "What draws you most to a destination?",
            type: "multiple_choice",
            options: ["Natural beauty", "Historical sites", "Local culture", "Unique experiences"]
          }
        ];
      }

      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rateLimitHeaders } }
      );
    }

    // Mode 2: Generate recommendations based on answers
    if (mode === 'recommendations') {
      // Validate schema
      const validated = RecommendationsSchema.parse(body);
      const { answers } = validated;

      // Step 1: Get real-time travel trends with retry + fallback
      let travelTrends = "";
      const fetchPerplexity = async (retries = 2, delay = 1000): Promise<string> => {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const resp = await fetch("https://api.perplexity.ai/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "sonar",
                messages: [
                  { role: "system", content: "You are a travel trend analyst. Provide current travel trends and emerging destinations." },
                  { role: "user", content: `Based on these travel preferences: ${JSON.stringify(answers)}, what are the current travel trends and emerging destinations that would match? Focus on offbeat and authentic experiences.` }
                ],
                temperature: 0.3,
                max_tokens: 500,
              }),
            });
            if (resp.ok) {
              const data = await resp.json();
              return data.choices[0].message.content;
            }
            if (attempt < retries) await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
          } catch {
            if (attempt < retries) await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
          }
        }
        return "";
      };

      travelTrends = await fetchPerplexity();
      
      // Fallback: if Perplexity failed, use local trends from DB
      if (!travelTrends) {
        const { data: trendingPlaces } = await supabase
          .from('places')
          .select('name, city, country, category, mood_tags')
          .order('last_crowd_update', { ascending: false })
          .limit(10);
        
        if (trendingPlaces?.length) {
          travelTrends = `Trending destinations: ${trendingPlaces.map(p => `${p.name} in ${p.city}, ${p.country} (${p.category})`).join('; ')}. Focus on authentic, less crowded destinations with unique cultural experiences.`;
        } else {
          travelTrends = "Focus on authentic, less crowded destinations with unique cultural experiences. Prioritize hidden gems, local food scenes, and immersive cultural activities.";
        }
      }

      // Step 2: Get user's travel history and available places (RLS enforced)
      const { data: visits } = await supabase
        .from('user_place_visits')
        .select('place_id, places(name, category, mood_tags)')
        .eq('user_id', user.id)
        .limit(100);

      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('place_id, places(name, category, mood_tags)')
        .eq('user_id', user.id)
        .limit(50);

      const { data: allPlaces } = await supabase
        .from('places')
        .select('*')
        .eq('is_hidden_gem', true)
        .limit(50);

      // Exclude both visited AND favorited places for fresh recommendations
      const excludedIds = new Set([
        ...(visits?.map(v => v.place_id) || []),
        ...(favorites?.map(f => f.place_id) || [])
      ]);
      const availablePlaces = allPlaces?.filter(p => !excludedIds.has(p.id)) || [];

      // Extract place names with proper typing
      const visitedNames = visits?.map(v => {
        const place = v.places as { name: string; category: string; mood_tags: string[] } | null;
        return place?.name;
      }).filter(Boolean).join(', ') || 'None';
      
      const favoriteNames = favorites?.map(f => {
        const place = f.places as { name: string; category: string; mood_tags: string[] } | null;
        return place?.name;
      }).filter(Boolean).join(', ') || 'None';

      // Step 3: Use Gemini to analyze everything and generate personalized recommendations
      const recommendationPrompt = `You are an expert AI travel advisor. Analyze the following data and recommend the TOP 5 personalized destinations.

USER PREFERENCES (from questionnaire):
${JSON.stringify(answers, null, 2)}

REAL-TIME TRAVEL TRENDS (from Perplexity):
${travelTrends}

USER'S TRAVEL HISTORY:
Visited: ${visitedNames}
Favorites: ${favoriteNames}

AVAILABLE DESTINATIONS:
${JSON.stringify(availablePlaces.slice(0, 30).map(p => ({
  id: p.id,
  name: p.name,
  city: p.city,
  country: p.country,
  category: p.category,
  description: p.description,
  mood_tags: p.mood_tags
})), null, 2)}

TASK:
1. Analyze user preferences, trends, and history
2. Select 5 destinations from AVAILABLE DESTINATIONS that best match
3. Provide specific reasons why each place fits their profile
4. Return ONLY a JSON array with this structure:

[
  {
    "place_id": "<exact id from available destinations>",
    "reason": "brief explanation (max 100 chars)",
    "match_score": <number 0-100>,
    "unique_highlight": "what makes this special (max 80 chars)"
  }
]

Focus on hidden gems they haven't visited yet. Return ONLY JSON, no markdown.`;

      const geminiRecommendations = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: recommendationPrompt },
            { role: "user", content: "Generate personalized travel recommendations." }
          ],
          temperature: 0.7,
        }),
      });

      if (!geminiRecommendations.ok) {
        throw new Error(`Gemini API error: ${geminiRecommendations.status}`);
      }

      const geminiData = await geminiRecommendations.json();
      const content = geminiData.choices[0].message.content;

      let recommendations;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        recommendations = JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Fallback to top-rated available places
        recommendations = availablePlaces.slice(0, 5).map(place => ({
          place_id: place.id,
          reason: "Based on your travel preferences and current trends",
          match_score: 75,
          unique_highlight: "Authentic offbeat experience"
        }));
      }

      // Enrich recommendations with full place data
      const enrichedRecommendations = recommendations.map((rec: any) => {
        const place = availablePlaces.find(p => p.id === rec.place_id);
        return {
          ...place,
          recommendation_reason: rec.reason,
          match_score: rec.match_score,
          unique_highlight: rec.unique_highlight,
          ai_powered: true
        };
      }).filter((r: any) => r.id);

      return new Response(
        JSON.stringify({ 
          recommendations: enrichedRecommendations,
          powered_by: "Gemini + Perplexity AI"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rateLimitHeaders } }
      );
    }

    throw new Error("Invalid mode. Use 'questions' or 'recommendations'");

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Minimal production logging - no sensitive data
    console.error("smart-recommendations error");
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
