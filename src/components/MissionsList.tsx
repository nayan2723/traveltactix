import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LocationSelector } from '@/components/LocationSelector';
import { MissionCard } from '@/components/MissionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Target } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  city: string;
  country: string;
  deadline: string;
  is_active: boolean;
}

interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  is_hidden_gem: boolean;
  cultural_tips: any;
}

export function MissionsList() {
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; country: string } | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocationData = async (city: string, country: string) => {
    setLoading(true);
    try {
      // Generate AI missions for the selected location
      const { data: aiMissionsData, error: aiError } = await supabase.functions.invoke('generate-missions', {
        body: { city, country }
      });

      if (aiError) {
        console.error('Error generating AI missions:', aiError);
        setMissions([]);
      } else {
        setMissions(aiMissionsData?.missions || []);
      }

      // Fetch places for the selected location
      const { data: placesData } = await supabase
        .from('places')
        .select('*')
        .eq('city', city)
        .eq('country', country)
        .order('name');

      setPlaces(placesData || []);
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (city: string, country: string) => {
    setSelectedLocation({ city, country });
    fetchLocationData(city, country);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location-Based Missions</h2>
          <p className="text-muted-foreground">Discover adventures tailored to your destination</p>
        </div>
        <LocationSelector
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </div>

      {selectedLocation && (
        <Card className="bg-card-gradient border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Exploring {selectedLocation.city}, {selectedLocation.country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm">{missions.length} Missions Available</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-sm">{places.length} Places to Discover</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="text-sm">New missions daily</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading missions...</div>
        </div>
      )}

      {!selectedLocation && !loading && (
        <Card className="text-center py-8">
          <CardContent>
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Choose Your Adventure</h3>
            <p className="text-muted-foreground">
              Select a destination above to discover exciting missions and places to explore
            </p>
          </CardContent>
        </Card>
      )}

      {selectedLocation && !loading && missions.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Missions Available</h3>
            <p className="text-muted-foreground">
              No missions found for {selectedLocation.city}. Check back later for new adventures!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missions Grid */}
      {selectedLocation && !loading && missions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Available Missions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStart={() => {}}
                formatDeadline={formatDeadline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Places to Explore */}
      {selectedLocation && !loading && places.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Places to Explore</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {places.map((place) => (
              <Card key={place.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{place.name}</h4>
                    {place.is_hidden_gem && (
                      <Badge variant="secondary" className="text-xs">
                        Hidden Gem
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {place.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {place.category}
                    </Badge>
                  </div>
                  {place.cultural_tips?.tips && (
                    <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                      <strong>Tip:</strong> {place.cultural_tips.tips[0]}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}