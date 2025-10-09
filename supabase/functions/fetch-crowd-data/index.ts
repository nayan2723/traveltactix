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
    const { placeId } = await req.json();
    
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch place details from our database
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .single();

    if (placeError || !place) {
      console.error('Place fetch error:', placeError);
      return new Response(
        JSON.stringify({ error: 'Place not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate realistic crowd data based on time of day and place characteristics
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base crowd percentage varies by category
    let baseCrowd = 40;
    const category = place.category?.toLowerCase() || '';
    
    if (category.includes('temple') || category.includes('religious')) {
      baseCrowd = isWeekend ? 65 : 35;
    } else if (category.includes('museum') || category.includes('cultural')) {
      baseCrowd = isWeekend ? 70 : 45;
    } else if (category.includes('beach') || category.includes('park')) {
      baseCrowd = isWeekend ? 75 : 30;
    } else if (category.includes('restaurant') || category.includes('food')) {
      baseCrowd = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21) ? 80 : 25;
    } else if (category.includes('shopping') || category.includes('market')) {
      baseCrowd = isWeekend ? 85 : 50;
    }
    
    // Adjust for time of day
    let timeMultiplier = 1.0;
    if (hour >= 6 && hour < 9) {
      timeMultiplier = 0.4; // Early morning - low crowds
    } else if (hour >= 9 && hour < 12) {
      timeMultiplier = 0.8; // Mid-morning - building up
    } else if (hour >= 12 && hour < 15) {
      timeMultiplier = 1.2; // Lunch/afternoon - peak
    } else if (hour >= 15 && hour < 18) {
      timeMultiplier = 1.0; // Afternoon - moderate
    } else if (hour >= 18 && hour < 21) {
      timeMultiplier = 0.9; // Evening - tapering off
    } else {
      timeMultiplier = 0.3; // Night - very low
    }
    
    // Add some randomness for realism
    const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
    
    const crowdPercentage = Math.min(95, Math.max(5, Math.round(baseCrowd * timeMultiplier * randomFactor)));
    
    let crowdStatus = 'low';
    if (crowdPercentage > 65) {
      crowdStatus = 'high';
    } else if (crowdPercentage > 35) {
      crowdStatus = 'medium';
    }

    // Generate smart best visit times based on crowd patterns
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const bestVisitTimes = days.map(day => {
      const isWeekendDay = day === 'Saturday' || day === 'Sunday';
      let hours, crowd_level;
      
      if (category.includes('restaurant') || category.includes('food')) {
        hours = isWeekendDay ? '10:00-11:30' : '14:30-16:00';
        crowd_level = 'low';
      } else if (category.includes('museum') || category.includes('cultural')) {
        hours = isWeekendDay ? '9:00-10:00' : '14:00-16:00';
        crowd_level = isWeekendDay ? 'medium' : 'low';
      } else if (category.includes('temple') || category.includes('religious')) {
        hours = '6:00-8:00';
        crowd_level = 'low';
      } else {
        hours = isWeekendDay ? '7:00-9:00' : '9:00-11:00';
        crowd_level = isWeekendDay ? 'medium' : 'low';
      }
      
      return { day, hours, crowd_level };
    });

    // Update place in database
    const { error: updateError } = await supabase
      .from('places')
      .update({
        crowd_status: crowdStatus,
        crowd_percentage: crowdPercentage,
        best_visit_times: bestVisitTimes,
        last_crowd_update: new Date().toISOString()
      })
      .eq('id', placeId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    return new Response(
      JSON.stringify({
        crowd_status: crowdStatus,
        crowd_percentage: crowdPercentage,
        best_visit_times: bestVisitTimes,
        last_updated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-crowd-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
