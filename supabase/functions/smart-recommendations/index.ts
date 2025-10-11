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
    const { userId, answers, mode } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Mode 1: Generate personalized questions
    if (mode === 'questions') {
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

Make questions engaging and personalized.`;

      const geminiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: questionPrompt },
            { role: "user", content: "Generate personalized travel preference questions." }
          ],
          temperature: 0.8,
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      let questions = [];
      
      try {
        const content = geminiData.choices[0].message.content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        questions = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse questions:", e);
        questions = [
          {
            id: "q1",
            question: "What's your ideal travel style?",
            type: "multiple_choice",
            options: ["Adventure & Exploration", "Relaxation & Leisure", "Cultural Immersion", "Food & Culinary"]
          },
          {
            id: "q2",
            question: "What's your budget preference?",
            type: "multiple_choice",
            options: ["Budget-friendly", "Moderate", "Luxury", "No budget constraints"]
          },
          {
            id: "q3",
            question: "How do you feel about crowds?",
            type: "multiple_choice",
            options: ["Love popular tourist spots", "Prefer moderate crowds", "Seek hidden gems only", "Flexible"]
          },
          {
            id: "q4",
            question: "What's your activity level?",
            type: "multiple_choice",
            options: ["Very active (hiking, sports)", "Moderate (walking tours)", "Leisurely (sightseeing)", "Relaxed (minimal walking)"]
          },
          {
            id: "q5",
            question: "What interests you most?",
            type: "multiple_choice",
            options: ["History & Museums", "Art & Architecture", "Local Experiences", "Nature & Wildlife"]
          }
        ];
      }

      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode 2: Generate recommendations based on answers
    if (mode === 'recommendations' && answers) {
      // Step 1: Use Perplexity to get real-time travel trends and insights
      console.log("Fetching real-time travel trends from Perplexity...");
      
      const trendQuery = `Based on these travel preferences: ${JSON.stringify(answers)}, what are the current trending offbeat and hidden gem destinations in 2025? Focus on less crowded, authentic experiences.`;
      
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a travel trends expert. Provide current, real-time information about trending destinations and hidden gems.'
            },
            {
              role: 'user',
              content: trendQuery
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      let travelTrends = "";
      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json();
        travelTrends = perplexityData.choices[0].message.content;
        console.log("Perplexity trends:", travelTrends.substring(0, 200));
      } else {
        console.error("Perplexity API error:", perplexityResponse.status);
        travelTrends = "Focus on authentic, less crowded destinations with unique cultural experiences.";
      }

      // Step 2: Get user's travel history and available places
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

      const { data: allPlaces } = await supabase
        .from('places')
        .select('*')
        .eq('is_hidden_gem', true)
        .limit(50);

      const visitedPlaceIds = new Set(visits?.map(v => v.place_id) || []);
      const availablePlaces = allPlaces?.filter(p => !visitedPlaceIds.has(p.id)) || [];

      // Step 3: Use Gemini to analyze everything and generate personalized recommendations
      console.log("Generating personalized recommendations with Gemini...");

      const recommendationPrompt = `You are an expert AI travel advisor. Analyze the following data and recommend the TOP 5 personalized destinations.

USER PREFERENCES (from questionnaire):
${JSON.stringify(answers, null, 2)}

REAL-TIME TRAVEL TRENDS (from Perplexity):
${travelTrends}

USER'S TRAVEL HISTORY:
Visited: ${visits?.map(v => v.places?.name).join(', ') || 'None'}
Favorites: ${favorites?.map(f => f.places?.name).join(', ') || 'None'}

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

INSTRUCTIONS:
1. Analyze user preferences deeply
2. Consider real-time trends from Perplexity
3. Match destinations to user's style (avoid visited places)
4. Prioritize hidden gems and offbeat locations
5. Give diversity in recommendations
6. For each recommendation, provide:
   - place_id (from available destinations)
   - reason (2-3 sentences explaining perfect match)
   - match_score (0-100)
   - unique_highlight (what makes it special for this user)

Return ONLY a JSON array of exactly 5 recommendations, no other text:
[
  {
    "place_id": "uuid",
    "reason": "detailed explanation",
    "match_score": 95,
    "unique_highlight": "special feature"
  }
]`;

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
            { role: "user", content: "Generate the 5 best personalized recommendations." }
          ],
          temperature: 0.7,
        }),
      });

      if (!geminiRecommendations.ok) {
        throw new Error(`Gemini API error: ${geminiRecommendations.status}`);
      }

      const geminiData = await geminiRecommendations.json();
      const content = geminiData.choices[0].message.content;
      
      console.log("Gemini response:", content);

      let recommendations;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        recommendations = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse recommendations:", e);
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

      console.log(`Generated ${enrichedRecommendations.length} AI-powered recommendations`);

      return new Response(
        JSON.stringify({ 
          recommendations: enrichedRecommendations,
          powered_by: "Gemini + Perplexity AI"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error("Invalid mode. Use 'questions' or 'recommendations'");

  } catch (error) {
    console.error("Error in smart-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
