import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainNav } from "@/components/MainNav";
import { CrowdMap } from "@/components/CrowdMap";
import { CrowdDashboard } from "@/components/CrowdDashboard";
import { AlternativeSuggestions } from "@/components/AlternativeSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Heart, 
  Search, 
  Filter,
  Gem,
  Star,
  Camera,
  Leaf,
  Coffee,
  Mountain,
  Calendar
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AIRecommendations } from "@/components/AIRecommendations";
import { ItineraryBuilder } from "@/components/ItineraryBuilder";

interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  is_hidden_gem: boolean;
  mood_tags: string[];
  estimated_visit_time: number;
  image_urls: string[];
  cultural_tips: any;
}

const moodFilters = [
  { name: 'Adventure', icon: Mountain, color: 'bg-orange-500' },
  { name: 'Relax', icon: Leaf, color: 'bg-green-500' },
  { name: 'Instagrammable', icon: Camera, color: 'bg-pink-500' },
  { name: 'Spiritual', icon: Star, color: 'bg-purple-500' },
  { name: 'Foodie', icon: Coffee, color: 'bg-amber-500' },
  { name: 'Eco-friendly', icon: Leaf, color: 'bg-emerald-500' }
];

const Discovery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showHiddenGems, setShowHiddenGems] = useState(true);
  const [selectedForItinerary, setSelectedForItinerary] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'crowd'>('grid');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchPlaces();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterPlaces();
  }, [places, searchTerm, selectedMoods, showHiddenGems]);

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('place_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.place_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const filterPlaces = () => {
    let filtered = places;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by mood tags
    if (selectedMoods.length > 0) {
      filtered = filtered.filter(place =>
        selectedMoods.some(mood => place.mood_tags?.includes(mood))
      );
    }

    // Filter by hidden gems
    if (showHiddenGems) {
      filtered = filtered.filter(place => place.is_hidden_gem);
    }

    setFilteredPlaces(filtered);
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const toggleItinerarySelection = (placeId: string) => {
    setSelectedForItinerary(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(placeId)) {
        newSelection.delete(placeId);
      } else {
        newSelection.add(placeId);
      }
      return newSelection;
    });
  };

  const toggleFavorite = async (placeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      if (favorites.has(placeId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('place_id', placeId);

        if (error) throw error;
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(placeId);
          return newFavorites;
        });
        toast({
          title: "Removed from favorites",
          description: "Destination removed from your wishlist"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            place_id: placeId
          });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, placeId]));
        toast({
          title: "Added to favorites",
          description: "Destination saved to your wishlist"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Discover{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Hidden
              </span>
              <br />
              Gems
            </motion.h1>

            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              AI-powered recommendations for offbeat destinations and unique experiences
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search destinations, cities, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Mood Filters */}
            <div className="flex flex-wrap gap-2">
              {moodFilters.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMoods.includes(mood.name);
                return (
                  <Button
                    key={mood.name}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMood(mood.name)}
                    className={isSelected ? `${mood.color} text-white` : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {mood.name}
                  </Button>
                );
              })}
            </div>

            {/* Hidden Gems Toggle */}
            <Button
              variant={showHiddenGems ? "default" : "outline"}
              onClick={() => setShowHiddenGems(!showHiddenGems)}
              className="shrink-0"
            >
              <Gem className="w-4 h-4 mr-2" />
              {showHiddenGems ? "Hidden Gems Only" : "Show All"}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
            >
              Grid View
            </Button>
            <Button
              onClick={() => setViewMode('crowd')}
              variant={viewMode === 'crowd' ? 'default' : 'outline'}
            >
              Crowd Monitor
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredPlaces.length} destination{filteredPlaces.length !== 1 ? 's' : ''}
            {selectedMoods.length > 0 && (
              <span> matching: {selectedMoods.join(', ')}</span>
            )}
          </p>
        </div>

        {/* AI Recommendations */}
        <div className="mb-8">
          <AIRecommendations preferences={{ moods: selectedMoods }} />
        </div>

        {/* Itinerary Builder */}
        {selectedForItinerary.size > 0 && (
          <div className="mb-8">
            <ItineraryBuilder selectedPlaceIds={Array.from(selectedForItinerary)} />
          </div>
        )}

        {/* Crowd Monitoring Views */}
        {viewMode === 'crowd' ? (
          <div className="space-y-8">
            <CrowdDashboard />
            <CrowdMap 
              places={filteredPlaces.map(p => ({
                id: p.id,
                name: p.name,
                city: p.city,
                latitude: Number(p.latitude) || 0,
                longitude: Number(p.longitude) || 0,
                crowd_status: 'medium',
                crowd_percentage: 50
              }))}
              onPlaceClick={(place) => setSelectedCity(place.city)}
            />
            {selectedCity && (
              <AlternativeSuggestions currentCity={selectedCity} />
            )}
          </div>
        ) : (
          <>
            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="travel-card overflow-hidden group cursor-pointer h-full">
                <div className="relative">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${place.image_urls?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'})`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Hidden Gem Badge */}
                    {place.is_hidden_gem && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-white">
                          <Gem className="w-3 h-3 mr-1" />
                          Hidden Gem
                        </Badge>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`bg-white/20 hover:bg-white/40 ${
                          selectedForItinerary.has(place.id) ? 'bg-primary text-white' : 'text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItinerarySelection(place.id);
                        }}
                        title="Add to itinerary"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 hover:bg-white/40 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(place.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(place.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Location Info */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {place.city}, {place.country}
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{place.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Mood Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {place.mood_tags?.slice(0, 3).map((tag) => {
                      const mood = moodFilters.find(m => m.name === tag);
                      return (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {mood && <mood.icon className="w-3 h-3 mr-1" />}
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Visit Time */}
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    {place.estimated_visit_time > 60 
                      ? `${Math.round(place.estimated_visit_time / 60)}h`
                      : `${place.estimated_visit_time}min`
                    } visit
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => window.open(`/places/${place.id}`, '_blank')}
                  >
                    Explore Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
            </div>
          </>
        )}

        {/* No Results */}
        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <Gem className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedMoods([]);
                setShowHiddenGems(true);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;