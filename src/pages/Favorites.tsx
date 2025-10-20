import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainNav } from "@/components/MainNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Heart, 
  Gem,
  Trash2,
  Eye
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FavoritePlace {
  id: string;
  place_id: string;
  created_at: string;
  places: {
    id: string;
    name: string;
    description: string;
    category: string;
    city: string;
    country: string;
    is_hidden_gem: boolean;
    mood_tags: string[];
    estimated_visit_time: number;
    image_urls: string[];
  };
}

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          place_id,
          created_at,
          places (
            id,
            name,
            description,
            category,
            city,
            country,
            is_hidden_gem,
            mood_tags,
            estimated_visit_time,
            image_urls
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, placeName: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: "Removed from favorites",
        description: `${placeName} removed from your wishlist`
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view favorites</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to save your favorite destinations
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/20 rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />
      
      {/* Header */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-destructive/10 to-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Your{" "}
              <span className="bg-gradient-to-r from-destructive via-primary to-secondary bg-clip-text text-transparent">
                Favorites
              </span>
            </motion.h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your personal collection of amazing places you want to explore
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and save destinations you'd love to visit
            </p>
            <Button onClick={() => navigate('/discovery')}>
              Discover Destinations
            </Button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {favorites.length} Saved Destination{favorites.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-muted-foreground">
                {favorites.filter(f => f.places.is_hidden_gem).length} hidden gem{favorites.filter(f => f.places.is_hidden_gem).length !== 1 ? 's' : ''} in your collection
              </p>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="travel-card overflow-hidden group h-full">
                    <div className="relative">
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${favorite.places.image_urls?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'})`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Hidden Gem Badge */}
                        {favorite.places.is_hidden_gem && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary text-white">
                              <Gem className="w-3 h-3 mr-1" />
                              Hidden Gem
                            </Badge>
                          </div>
                        )}

                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-background/20 hover:bg-destructive text-foreground"
                          onClick={() => removeFavorite(favorite.id, favorite.places.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* Location Info */}
                        <div className="absolute bottom-3 left-3 text-foreground">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {favorite.places.city}, {favorite.places.country}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{favorite.places.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {favorite.places.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Mood Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {favorite.places.mood_tags?.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Visit Time */}
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        {favorite.places.estimated_visit_time > 60 
                          ? `${Math.round(favorite.places.estimated_visit_time / 60)}h`
                          : `${favorite.places.estimated_visit_time}min`
                        } visit
                      </div>

                      {/* Saved Date */}
                      <div className="text-xs text-muted-foreground mb-4">
                        Saved {new Date(favorite.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => navigate(`/places/${favorite.places.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavorite(favorite.id, favorite.places.name)}
                        >
                          <Heart className="w-4 h-4 fill-destructive text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;