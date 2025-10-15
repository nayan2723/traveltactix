import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MapPin, Clock, Heart } from "lucide-react";
import { motion } from "motion/react";

interface Recommendation {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  mood_tags: string[];
  estimated_visit_time: number;
  image_urls: string[];
  recommendation_reason: string;
  match_score: number;
}

interface AIRecommendationsProps {
  preferences?: any;
}

export const AIRecommendations = ({ preferences }: AIRecommendationsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to get personalized recommendations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          userId: user.id,
          preferences: preferences || {}
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      toast({
        title: "Recommendations Generated!",
        description: `Found ${data.recommendations?.length || 0} personalized destinations`,
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Recommendations
          </h3>
          <p className="text-muted-foreground">
            Personalized suggestions based on your travel history
          </p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={loading || !user}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Generating..." : "Get Recommendations"}
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-32 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${place.image_urls?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'})`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-white">
                      {place.match_score}% Match
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {place.city}, {place.country}
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{place.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {place.estimated_visit_time > 60 
                      ? `${Math.round(place.estimated_visit_time / 60)}h`
                      : `${place.estimated_visit_time}min`
                    }
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {place.mood_tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">Why this fits: </span>
                      {place.recommendation_reason}
                    </p>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/places/${place.id}`)}
                  >
                    Explore Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
