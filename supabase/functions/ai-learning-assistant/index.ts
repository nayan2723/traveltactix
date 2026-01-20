import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const HintRequestSchema = z.object({
  type: z.literal('hint'),
  question: z.string().min(1).max(500),
  context: z.object({
    lesson: z.string().max(200),
    language: z.string().max(50),
    difficulty: z.string().max(20)
  })
});

const TranslateRequestSchema = z.object({
  type: z.literal('translate'),
  text: z.string().min(1).max(2000),
  targetLanguage: z.string().min(2).max(50)
});

const RequestSchema = z.discriminatedUnion('type', [
  HintRequestSchema,
  TranslateRequestSchema
]);

// Rate limit configuration: 30 requests per hour per user
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60; // minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract auth header for user identification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Create client with user's auth token to get user ID
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for rate limiting
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_function_name: 'ai-learning-assistant',
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

    const body = await req.json();
    
    // Validate input
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          details: validationResult.error.issues.map(i => i.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = validationResult.data;

    let systemPrompt = '';
    let userPrompt = '';

    if (data.type === 'hint') {
      systemPrompt = `You are a helpful cultural learning assistant. Your role is to provide subtle, educational hints that guide learners without giving away direct answers. Focus on cultural context, background information, and learning strategies. Keep hints concise (2-3 sentences) and encouraging.`;
      
      userPrompt = `The student is learning about ${data.context.lesson} in ${data.context.language} (${data.context.difficulty} level).

They're working on this question: "${data.question}"

Provide a helpful hint that:
1. Gives cultural context or background
2. Points them in the right direction
3. Doesn't reveal the direct answer
4. Encourages critical thinking`;
    } else if (data.type === 'translate') {
      systemPrompt = `You are a professional translator specializing in cultural and educational content. Provide accurate, natural translations that preserve meaning and cultural nuance.`;
      
      userPrompt = `Translate the following English text to ${data.targetLanguage}:

"${data.text}"

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

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    // Include rate limit info in response headers
    const remaining = rateLimitResult?.[0] ? RATE_LIMIT_MAX - rateLimitResult[0].current_count : RATE_LIMIT_MAX;
    const responseHeaders = {
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
      'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    };

    if (data.type === 'hint') {
      return new Response(
        JSON.stringify({ hint: content }),
        { headers: responseHeaders }
      );
    } else if (data.type === 'translate') {
      return new Response(
        JSON.stringify({ translation: content }),
        { headers: responseHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-learning-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
