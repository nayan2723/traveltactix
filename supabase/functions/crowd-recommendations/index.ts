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
    const { action, answers } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !PERPLEXITY_API_KEY) {
      throw new Error('API keys not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (action === 'generate_questions') {
      // Use Gemini to generate personalized questions
      const questionPrompt = `You are a travel preference expert. Generate 5 insightful questions to understand a traveler's crowd preferences and travel style.

The questions should help determine:
1. Their tolerance for crowded places
2. Preferred times to travel (peak vs off-peak)
3. Type of experiences they seek
4. Budget considerations related to crowd-avoiding strategies
5. Travel companions and accessibility needs

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "id": "q1",
      "question": "How do you feel about crowded tourist attractions?",
      "options": ["I love the energy of busy places", "I prefer moderate crowds", "I actively avoid crowds", "I don't mind as long as it's worth it"]
    }
  ]
}

Make questions engaging, specific, and helpful for crowd-aware recommendations.`;

      const questionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a travel preference expert. Always return valid JSON only.' },
            { role: 'user', content: questionPrompt }
          ],
        }),
      });

      if (!questionResponse.ok) {
        throw new Error('Failed to generate questions');
      }

      const questionData = await questionResponse.json();
      const cleanContent = questionData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
      const questionsResult = JSON.parse(cleanContent);

      return new Response(
        JSON.stringify(questionsResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_recommendations') {
      // Get current user context
      const authHeader = req.headers.get('Authorization');
      let userId = null;
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }

      // Fetch all places with crowd data
      const { data: places } = await supabase
        .from('places')
        .select('*')
        .order('crowd_percentage', { ascending: true });

      if (!places || places.length === 0) {
        throw new Error('No places found');
      }

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
              content: 'You are a real-time travel and crowd analytics expert.'
            },
            {
              role: 'user',
              content: `What are the current crowd trends and best practices for avoiding crowds at tourist destinations? Consider seasonal patterns, time of day, and current events.`
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      let realtimeTrends = '';
      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json();
        realtimeTrends = perplexityData.choices[0].message.content;
        console.log('Real-time trends:', realtimeTrends);
      }

      // Use Gemini to generate personalized recommendations
      const recommendationPrompt = `You are an expert travel recommendation system with access to real-time crowd data.

User Preferences:
${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

Real-time Crowd Trends:
${realtimeTrends}

Available Places (with current crowd data):
${JSON.stringify(places.map(p => ({
  id: p.id,
  name: p.name,
  city: p.city,
  category: p.category,
  crowd_percentage: p.crowd_percentage,
  crowd_status: p.crowd_status,
  description: p.description
})))}

Based on the user's preferences and real-time crowd data, recommend the TOP 5 places that:
1. Match their crowd tolerance preferences
2. Have favorable crowd conditions right now
3. Align with their travel style
4. Provide unique experiences

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "place_id": "<uuid>",
      "name": "Place Name",
      "city": "City",
      "crowd_percentage": <number>,
      "crowd_status": "<low|medium|high>",
      "reason": "Why this matches their preferences and current crowd situation",
      "match_score": <85-99>,
      "unique_highlight": "What makes this special right now"
    }
  ]
}

Prioritize places with lower crowds if the user prefers to avoid crowds.`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert travel recommendation system. Always return valid JSON only.' },
            { role: 'user', content: recommendationPrompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const aiData = await aiResponse.json();
      const cleanContent = aiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
      const recommendations = JSON.parse(cleanContent);

      console.log('Generated recommendations:', recommendations);

      return new Response(
        JSON.stringify(recommendations),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

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