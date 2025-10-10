import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, country } = await req.json();
    
    if (!city || !country) {
      return new Response(
        JSON.stringify({ error: 'City and country are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Fetch existing places for context
    const { data: places } = await supabase
      .from('places')
      .select('name, category, description')
      .eq('city', city)
      .eq('country', country)
      .limit(5);

    const placesContext = places && places.length > 0 
      ? `\n\nExisting places in this location: ${places.map(p => `${p.name} (${p.category})`).join(', ')}`
      : '';

    const indianDestinations = `
COMPREHENSIVE INDIAN DESTINATIONS BY STATE:

**Andhra Pradesh:** Tirupati (Tirumala Temple), Visakhapatnam (Beaches, Araku Valley), Amaravati, Vijayawada, Gandikota (Grand Canyon of India)

**Arunachal Pradesh:** Tawang (Tawang Monastery), Ziro Valley, Namdapha National Park, Sela Pass, Bomdila

**Assam:** Guwahati (Kamakhya Temple), Kaziranga National Park, Majuli Island, Sivasagar, Jorhat Tea Gardens

**Bihar:** Bodh Gaya, Nalanda, Rajgir, Patna (Golghar, Patna Museum), Vaishali

**Chhattisgarh:** Chitrakote Falls, Bastar (Tribal Culture), Sirpur, Rajim, Bhilai

**Goa:** Beaches (Baga, Calangute, Anjuna, Palolem), Old Goa Churches, Dudhsagar Falls, Spice Plantations

**Gujarat:** Ahmedabad (Sabarmati Ashram), Dwarka, Somnath, Gir National Park, Rann of Kutch, Statue of Unity

**Haryana:** Kurukshetra, Faridabad, Sultanpur Bird Sanctuary, Pinjore Gardens

**Himachal Pradesh:** Shimla, Manali, Dharamshala, McLeod Ganj, Spiti Valley, Kasol, Kullu, Dalhousie

**Jharkhand:** Ranchi (Hundru Falls), Jamshedpur, Netarhat, Betla National Park, Deoghar

**Karnataka:** Bangalore, Mysore (Mysore Palace), Hampi, Coorg, Gokarna, Chikmagalur, Badami, Udupi

**Kerala:** Kochi (Fort Kochi), Munnar, Alleppey (Backwaters), Thekkady, Wayanad, Kovalam, Varkala

**Madhya Pradesh:** Khajuraho, Sanchi, Ujjain, Bhopal, Pachmarhi, Kanha National Park, Bandhavgarh

**Maharashtra:** Mumbai (Gateway of India, Marine Drive), Pune, Aurangabad (Ajanta-Ellora Caves), Lonavala, Mahabaleshwar, Nashik

**Manipur:** Imphal (Loktak Lake), Kangla Fort, Keibul Lamjao National Park

**Meghalaya:** Shillong, Cherrapunji, Mawlynnong (Cleanest Village), Dawki, Living Root Bridges

**Mizoram:** Aizawl, Champhai, Phawngpui Peak, Vantawng Falls

**Nagaland:** Kohima, Dimapur, Hornbill Festival, Dzukou Valley

**Odisha:** Puri (Jagannath Temple), Konark (Sun Temple), Bhubaneswar, Chilika Lake, Simlipal National Park

**Punjab:** Amritsar (Golden Temple), Wagah Border, Chandigarh, Anandpur Sahib, Patiala

**Rajasthan:** Jaipur (City Palace, Hawa Mahal), Udaipur, Jaisalmer, Jodhpur, Pushkar, Mount Abu, Ranthambore

**Sikkim:** Gangtok, Nathula Pass, Tsomgo Lake, Pelling, Yuksom, Lachung

**Tamil Nadu:** Chennai (Marina Beach), Madurai (Meenakshi Temple), Rameshwaram, Kanyakumari, Ooty, Thanjavur, Mahabalipuram

**Telangana:** Hyderabad (Charminar, Golconda Fort), Warangal, Ramoji Film City

**Tripura:** Agartala, Ujjayanta Palace, Neermahal, Sepahijala Wildlife Sanctuary

**Uttar Pradesh:** Agra (Taj Mahal), Varanasi, Lucknow, Mathura-Vrindavan, Ayodhya, Allahabad (Prayagraj)

**Uttarakhand:** Rishikesh, Haridwar, Nainital, Mussoorie, Auli, Valley of Flowers, Kedarnath, Badrinath

**West Bengal:** Kolkata (Victoria Memorial, Howrah Bridge), Darjeeling, Sundarbans, Kalimpong, Shantiniketan

**Union Territories:**
- Delhi: Red Fort, Qutub Minar, India Gate, Lotus Temple, Humayun's Tomb
- Jammu & Kashmir: Srinagar (Dal Lake), Gulmarg, Pahalgam, Leh-Ladakh, Vaishno Devi
- Ladakh: Leh, Nubra Valley, Pangong Lake, Tso Moriri, Magnetic Hill
- Puducherry: French Quarter, Auroville, Promenade Beach
- Andaman & Nicobar: Port Blair, Havelock Island, Neil Island, Cellular Jail
- Chandigarh: Rock Garden, Sukhna Lake, Rose Garden
- Lakshadweep: Kavaratti, Agatti, Bangaram Island
`;

    const systemPrompt = `You are a travel mission designer for TravelTacTix, specializing in creating engaging, culturally-rich missions for Indian destinations.

Generate 6-8 unique missions for ${city}, ${country}. Each mission should:
- Be authentic to Indian culture, traditions, and experiences
- Leverage the specific attractions, culture, and heritage of ${city}
- Reference actual landmarks, festivals, cuisines, or traditions from the region
- Focus on local cuisine, heritage sites, festivals, art forms, markets, or unique activities
- Have varying difficulty levels (easy, medium, hard)
- Offer appropriate XP rewards (easy: 50-100 XP, medium: 100-200 XP, hard: 200-300 XP)
- Include realistic deadlines (3-14 days from now)
- Be specific and actionable

Categories to choose from: food, culture, adventure, photography, heritage, shopping, nature, spiritual

${indianDestinations}

${placesContext}

Use the comprehensive destination list above to create missions that reflect the TRUE attractions and experiences available in ${city}. Make missions location-specific and authentic.

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Mission title (max 60 chars)",
    "description": "Detailed description (max 200 chars)",
    "category": "category name",
    "difficulty": "easy|medium|hard",
    "xp_reward": number,
    "deadline_days": number (3-14)
  }
]`;

    console.log('Generating missions for:', city, country);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create exciting missions for travelers in ${city}, ${country}` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response
    let missions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      missions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      missions = [];
    }

    // Check for existing missions for this location
    const { data: existingMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('city', city)
      .eq('country', country)
      .gte('deadline', new Date().toISOString());

    // If we have recent missions, return them
    if (existingMissions && existingMissions.length > 0) {
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('city', city)
        .eq('country', country)
        .gte('deadline', new Date().toISOString())
        .order('created_at', { ascending: false });

      console.log(`Returning ${missions?.length || 0} existing missions`);
      return new Response(
        JSON.stringify({ missions: missions || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format missions with proper structure
    const formattedMissions = missions.map((mission: any) => {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (mission.deadline_days || 7));
      
      return {
        title: mission.title,
        description: mission.description,
        category: mission.category,
        difficulty: mission.difficulty,
        xp_reward: mission.xp_reward,
        city,
        country,
        deadline: deadlineDate.toISOString(),
        is_active: true,
      };
    });

    // Save missions to database
    const { data: savedMissions, error: saveError } = await supabase
      .from('missions')
      .insert(formattedMissions)
      .select();

    if (saveError) {
      console.error('Error saving missions:', saveError);
      throw saveError;
    }

    console.log(`Generated and saved ${savedMissions?.length || 0} missions`);

    return new Response(
      JSON.stringify({ missions: savedMissions || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-missions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        missions: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
