import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Heart, 
  ArrowLeft,
  Camera,
  Info,
  Star,
  Navigation,
  Share2
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [place, setPlace] = useState<Place | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlace();
      if (user) {
        checkFavoriteStatus();
      }
    }
  }, [id, user]);

  const fetchPlace = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlace(data);
    } catch (error) {
      console.error('Error fetching place:', error);
      toast({
        title: "Error",
        description: "Failed to load destination details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !place) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('place_id', place.id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Destination removed from your wishlist"
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            place_id: place.id
          });

        if (error) throw error;
        setIsFavorite(true);
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

  const sharePlace = async () => {
    if (navigator.share && place) {
      try {
        await navigator.share({
          title: place.name,
          text: place.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Destination link copied to clipboard"
      });
    }
  };

  const openInMaps = () => {
    if (place) {
      const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Destination not found</h2>
          <Button onClick={() => navigate('/discovery')}>
            Back to Discovery
          </Button>
        </div>
      </div>
    );
  }

  const culturalTips = place.cultural_tips?.tips || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/discovery')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div
            className="h-64 md:h-80 bg-cover bg-center rounded-xl"
            style={{
              backgroundImage: `url(${place.image_urls?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                onClick={sharePlace}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                onClick={toggleFavorite}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            </div>

            {/* Place Info Overlay */}
            <div className="absolute bottom-4 left-4 text-white">
              {place.is_hidden_gem && (
                <Badge className="bg-primary text-white mb-2">
                  Hidden Gem
                </Badge>
              )}
              <h1 className="heading-display text-3xl md:text-4xl mb-2">
                {place.name}
              </h1>
              <div className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {place.city}, {place.country}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    About This Place
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {place.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cultural Tips */}
            {culturalTips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Cultural Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {culturalTips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{place.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visit Time</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {place.estimated_visit_time > 60 
                        ? `${Math.round(place.estimated_visit_time / 60)}h`
                        : `${place.estimated_visit_time}min`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Perfect For</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {place.mood_tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Button onClick={openInMaps} className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
              <Button variant="outline" onClick={toggleFavorite} className="w-full">
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;