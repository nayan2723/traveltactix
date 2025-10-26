import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation schemas
interface LocationData {
  latitude: number;
  longitude: number;
}

interface VerificationRequest {
  user_mission_id: string;
  verification_type: 'location' | 'photo' | 'checkin' | 'quiz';
  verification_data: any;
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function validateLocation(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

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

    const requestBody = await req.json();
    const { user_mission_id, verification_type, verification_data } = requestBody as VerificationRequest;

    // Validate inputs
    if (!user_mission_id || !validateUUID(user_mission_id)) {
      return new Response(JSON.stringify({ error: 'Invalid mission ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['location', 'photo', 'checkin', 'quiz'].includes(verification_type)) {
      return new Response(JSON.stringify({ error: 'Invalid verification type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
          // Validate coordinates
          if (!validateLocation(verification_data.latitude, verification_data.longitude)) {
            verificationNotes = 'Invalid coordinates provided';
            break;
          }
          
          const distance = calculateDistance(
            verification_data.latitude,
            verification_data.longitude,
            userMission.missions.latitude,
            userMission.missions.longitude
          );
          
          console.log('Distance calculation:', {
            userLat: verification_data.latitude,
            userLng: verification_data.longitude,
            targetLat: userMission.missions.latitude,
            targetLng: userMission.missions.longitude,
            distanceKm: distance,
            distanceMeters: Math.round(distance * 1000)
          });
          
          // Within 100 meters for accurate landmark verification
          const VERIFICATION_RADIUS_KM = 0.1; // 100 meters
          isVerified = distance <= VERIFICATION_RADIUS_KM;
          verificationNotes = isVerified 
            ? `Location verified (${Math.round(distance * 1000)}m from target)`
            : `Too far from location (${Math.round(distance * 1000)}m away, need to be within ${VERIFICATION_RADIUS_KM * 1000}m)`;
        }
        break;

      case 'photo':
        // Use existing recognize-landmark function for photo verification
        if (verification_data.imageData) {
          const { data: recognitionData, error: recognitionError } = await supabase.functions.invoke('recognize-landmark', {
            body: { imageData: verification_data.imageData }
          });

          if (!recognitionError && recognitionData?.success && recognitionData?.landmark) {
            isVerified = recognitionData.landmark.confidence !== 'low';
            verificationNotes = isVerified 
              ? `Photo verified: ${recognitionData.landmark.name} in ${recognitionData.landmark.city}`
              : `Could not clearly identify landmark. Detected: ${recognitionData.landmark.name || 'unknown'}`;
          } else {
            verificationNotes = 'Could not verify landmark in photo';
          }
        } else {
          verificationNotes = 'No photo provided for verification';
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
    // Don't expose detailed error messages to client
    return new Response(
      JSON.stringify({ error: 'Mission verification failed' }),
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