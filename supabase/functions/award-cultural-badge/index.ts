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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { lessonId, completionData } = await req.json();

    if (!lessonId) {
      return new Response(JSON.stringify({ error: 'Lesson ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('cultural_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return new Response(JSON.stringify({ error: 'Lesson not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record progress
    const { error: progressError } = await supabase
      .from('user_cultural_progress')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        progress_type: 'lesson',
        cultural_xp_earned: lesson.cultural_xp,
        completion_data: completionData || {}
      });

    if (progressError) {
      console.error('Progress error:', progressError);
      return new Response(JSON.stringify({ error: 'Failed to record progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user XP in profile
    const { error: xpError } = await supabase.rpc('increment_xp', {
      user_id: user.id,
      xp_amount: lesson.cultural_xp
    });

    if (xpError) {
      console.error('XP update error:', xpError);
    }

    // Get newly awarded badges (trigger handles this)
    const { data: newBadges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({ 
      success: true,
      xp_earned: lesson.cultural_xp,
      badges: newBadges || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});