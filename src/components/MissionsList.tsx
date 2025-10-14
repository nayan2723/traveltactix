import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LocationSelector } from '@/components/LocationSelector';
import { MissionCard } from '@/components/MissionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Target, Navigation } from 'lucide-react';
import { MissionVerificationModal } from '@/components/MissionVerificationModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion } from 'framer-motion';

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
  latitude?: number;
  longitude?: number;
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
  const [userMissions, setUserMissions] = useState<any[]>([]);
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    userMissionId: string;
    missionTitle: string;
    verificationType: 'location' | 'photo' | 'checkin' | 'quiz';
    missionLocation?: { latitude: number; longitude: number };
    xpReward: number;
  } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  const fetchLocationData = async (city: string, country: string, useGeo: boolean = true) => {
    setLoading(true);
    try {
      // Generate AI missions for the selected location with geolocation if available
      const requestBody: any = { city, country };
      
      // Add geolocation data if available and enabled
      if (useGeo && latitude && longitude && !geoError) {
        requestBody.latitude = latitude;
        requestBody.longitude = longitude;
      }
      
      const { data: aiMissionsData, error: aiError } = await supabase.functions.invoke('generate-missions', {
        body: requestBody
      });

      if (aiError) {
        console.error('Error generating AI missions:', aiError);
        setMissions([]);
      } else {
        let fetchedMissions = aiMissionsData?.missions || [];
        
        // Filter missions by proximity if geolocation is available
        if (latitude && longitude) {
          fetchedMissions = fetchedMissions.filter((mission: Mission) => {
            if (!mission.latitude || !mission.longitude) return true;
            const distance = calculateDistance(
              latitude,
              longitude,
              Number(mission.latitude),
              Number(mission.longitude)
            );
            // Show missions within 50km radius
            return distance <= 50;
          });
        }
        
        setMissions(fetchedMissions);
      }

      // Fetch places for the selected location
      const { data: placesData } = await supabase
        .from('places')
        .select('*')
        .eq('city', city)
        .eq('country', country)
        .order('name');

      setPlaces(placesData || []);

      // Fetch user missions if logged in
      if (user) {
        const { data: userMissionsData } = await supabase
          .from('user_missions')
          .select('*')
          .eq('user_id', user.id);
        
        setUserMissions(userMissionsData || []);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationSelect = (city: string, country: string) => {
    setSelectedLocation({ city, country });
    fetchLocationData(city, country, true);
  };

  // Auto-fetch missions for user's current location on mount
  useEffect(() => {
    if (latitude && longitude && !geoError && !selectedLocation) {
      // Auto-detect and fetch missions for current location
      const detectLocationAndFetch = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-missions', {
            body: { latitude, longitude }
          });

          if (!error && data?.missions && data.missions.length > 0) {
            const firstMission = data.missions[0];
            if (firstMission.city && firstMission.country) {
              setSelectedLocation({ 
                city: firstMission.city, 
                country: firstMission.country 
              });
              setMissions(data.missions);
              setLoading(false);
              
              toast({
                title: "Missions found nearby!",
                description: `Showing ${data.missions.length} missions in ${firstMission.city}`,
              });
            }
          }
        } catch (err) {
          console.error('Error auto-detecting location:', err);
        }
      };

      detectLocationAndFetch();
    }
  }, [latitude, longitude, geoError, selectedLocation]);

  const handleStartMission = async (missionId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to start missions",
        variant: "destructive",
      });
      return;
    }

    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    try {
      const { data, error } = await supabase
        .from('user_missions')
        .insert({
          user_id: user.id,
          mission_id: missionId,
          progress: 0,
          total_required: 1,
          verification_type: 'location',
        })
        .select()
        .single();

      if (error) throw error;

      setUserMissions([...userMissions, data]);
      
      toast({
        title: "Mission Started!",
        description: "Good luck on your adventure!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start mission",
        variant: "destructive",
      });
    }
  };

  const handleVerifyMission = (userMissionId: string) => {
    const userMission = userMissions.find(um => um.id === userMissionId);
    if (!userMission) return;

    const mission = missions.find(m => m.id === userMission.mission_id);
    if (!mission) return;

    setVerificationModal({
      isOpen: true,
      userMissionId,
      missionTitle: mission.title,
      verificationType: userMission.verification_type || 'location',
      missionLocation: mission.latitude && mission.longitude ? {
        latitude: Number(mission.latitude),
        longitude: Number(mission.longitude),
      } : undefined,
      xpReward: mission.xp_reward,
    });
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
    <div className="space-y-8">
      {/* Geolocation Status */}
      {geoError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm"
        >
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-foreground">Couldn't fetch your location</p>
              <p className="text-muted-foreground mt-1">Showing all nearby missions. Enable location services for personalized results.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location Selector */}
      <div className="flex flex-col gap-6 items-stretch sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h2 className="heading-large text-3xl sm:text-4xl mb-2">Quest Missions</h2>
          <p className="text-muted-foreground">Discover adventures tailored to your destination</p>
          {latitude && longitude && (
            <p className="text-sm text-accent mt-2 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Showing missions near you
            </p>
          )}
        </div>
        <LocationSelector
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </div>

      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="travel-card border-border/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                Exploring {selectedLocation.city}, {selectedLocation.country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
                  <Target className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{missions.length}</p>
                    <p className="text-xs text-muted-foreground">Missions Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                  <MapPin className="h-5 w-5 text-secondary-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{places.length}</p>
                    <p className="text-xs text-muted-foreground">Places to Discover</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                  <Calendar className="h-5 w-5 text-warning-foreground" />
                  <div>
                    <p className="text-sm font-semibold">New missions</p>
                    <p className="text-xs text-muted-foreground">Updated daily</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {!selectedLocation && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-16 travel-card">
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 w-fit mx-auto">
                <MapPin className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Choose Your Adventure</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a destination above to discover exciting missions and places to explore
              </p>
            </CardContent>
          </Card>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">Available Missions</h3>
              <p className="text-sm text-muted-foreground mt-1">Complete quests to earn XP and unlock rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, index) => {
              const userMission = userMissions.find(um => um.mission_id === mission.id);
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MissionCard
                    mission={mission}
                    onStart={handleStartMission}
                    formatDeadline={formatDeadline}
                    userMission={userMission}
                    onVerify={handleVerifyMission}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Places to Explore */}
      {selectedLocation && !loading && places.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-semibold">Places to Explore</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Verification Modal */}
      {verificationModal && (
        <MissionVerificationModal
          isOpen={verificationModal.isOpen}
          onClose={() => setVerificationModal(null)}
          userMissionId={verificationModal.userMissionId}
          missionTitle={verificationModal.missionTitle}
          verificationType={verificationModal.verificationType}
          missionLocation={verificationModal.missionLocation}
          xpReward={verificationModal.xpReward}
          onSuccess={() => {
            if (selectedLocation) {
              fetchLocationData(selectedLocation.city, selectedLocation.country);
            }
          }}
        />
      )}
    </div>
  );
}