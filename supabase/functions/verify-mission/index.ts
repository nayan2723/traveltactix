import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_mission_id, verification_type, verification_data } = await req.json();

    console.log('Verifying mission:', { user_mission_id, verification_type });

    // Fetch user mission with mission details
    const { data: userMission, error: missionError } = await supabase
      .from('user_missions')
      .select(`
        *,
        missions (
          id,
          title,
          latitude,
          longitude,
          xp_reward,
          category
        )
      `)
      .eq('id', user_mission_id)
      .eq('user_id', user.id)
      .single();

    if (missionError || !userMission) {
      console.error('Mission fetch error:', missionError);
      return new Response(JSON.stringify({ error: 'Mission not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let isVerified = false;
    let verificationNotes = '';

    // Verification logic based on type
    switch (verification_type) {
      case 'location':
        if (verification_data.latitude && verification_data.longitude) {
          const distance = calculateDistance(
            verification_data.latitude,
            verification_data.longitude,
            userMission.missions.latitude,
            userMission.missions.longitude
          );
          
          // Within 500 meters
          isVerified = distance <= 0.5;
          verificationNotes = isVerified 
            ? `Location verified (${Math.round(distance * 1000)}m from target)`
            : `Too far from location (${Math.round(distance * 1000)}m away)`;
        }
        break;

      case 'photo':
        // Use existing recognize-landmark function for photo verification
        if (verification_data.photo) {
          const { data: recognitionData, error: recognitionError } = await supabase.functions.invoke('recognize-landmark', {
            body: { image: verification_data.photo }
          });

          if (!recognitionError && recognitionData?.landmarks?.length > 0) {
            isVerified = true;
            verificationNotes = `Photo verified: ${recognitionData.landmarks[0].description}`;
          } else {
            verificationNotes = 'Could not verify landmark in photo';
          }
        }
        break;

      case 'checkin':
        if (verification_data.checklist) {
          const completed = verification_data.checklist.filter((item: any) => item.completed).length;
          const total = verification_data.checklist.length;
          isVerified = completed === total;
          verificationNotes = `Checklist: ${completed}/${total} items completed`;
        }
        break;

      case 'quiz':
        if (verification_data.answers) {
          const correctAnswers = verification_data.answers.filter((a: any) => a.correct).length;
          const total = verification_data.answers.length;
          isVerified = correctAnswers >= Math.ceil(total * 0.7); // 70% pass rate
          verificationNotes = `Quiz: ${correctAnswers}/${total} correct answers`;
        }
        break;
    }

    // Update user mission
    const { error: updateError } = await supabase
      .from('user_missions')
      .update({
        verification_status: isVerified ? 'verified' : 'rejected',
        verification_data,
        verification_notes: verificationNotes,
        verified_at: isVerified ? new Date().toISOString() : null,
        is_completed: isVerified,
        completed_at: isVerified ? new Date().toISOString() : null,
        progress: isVerified ? userMission.total_required : userMission.progress,
      })
      .eq('id', user_mission_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update mission' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Award XP if verified
    if (isVerified) {
      const { error: xpError } = await supabase.rpc('increment', {
        table_name: 'profiles',
        row_id: user.id,
        column_name: 'total_xp',
        x: userMission.missions.xp_reward
      }).single();

      // If RPC doesn't exist, update directly
      if (xpError) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ 
              total_xp: (profile.total_xp || 0) + userMission.missions.xp_reward 
            })
            .eq('user_id', user.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isVerified,
        notes: verificationNotes,
        xp_awarded: isVerified ? userMission.missions.xp_reward : 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}