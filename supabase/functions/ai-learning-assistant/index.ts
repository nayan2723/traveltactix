import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, question, text, context, targetLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'hint') {
      systemPrompt = `You are a helpful cultural learning assistant. Your role is to provide subtle, educational hints that guide learners without giving away direct answers. Focus on cultural context, background information, and learning strategies. Keep hints concise (2-3 sentences) and encouraging.`;
      
      userPrompt = `The student is learning about ${context.lesson} in ${context.language} (${context.difficulty} level).

They're working on this question: "${question}"

Provide a helpful hint that:
1. Gives cultural context or background
2. Points them in the right direction
3. Doesn't reveal the direct answer
4. Encourages critical thinking`;
    } else if (type === 'translate') {
      systemPrompt = `You are a professional translator specializing in cultural and educational content. Provide accurate, natural translations that preserve meaning and cultural nuance.`;
      
      userPrompt = `Translate the following English text to ${targetLanguage}:

"${text}"

Provide only the translation, no explanations.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (type === 'hint') {
      return new Response(
        JSON.stringify({ hint: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'translate') {
      return new Response(
        JSON.stringify({ translation: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in ai-learning-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
