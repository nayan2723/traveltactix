import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  notification_type: 'mission' | 'achievement' | 'streak' | 'xp' | 'leaderboard' | 'info';
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    
    // Validate required fields
    if (!payload.user_id || !payload.title || !payload.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert notification
    const { data, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        notification_type: payload.notification_type || 'info',
        metadata: payload.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting notification:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification created:', data.id);

    return new Response(
      JSON.stringify({ success: true, notification: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
