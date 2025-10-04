import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Place {
  id: string;
  name: string;
  city: string;
  description: string;
  crowd_status: string;
  crowd_percentage: number;
  is_hidden_gem: boolean;
  image_urls: string[];
}

interface AlternativeSuggestionsProps {
  currentPlaceId?: string;
  currentCity?: string;
}

export const AlternativeSuggestions = ({ 
  currentPlaceId, 
  currentCity 
}: AlternativeSuggestionsProps) => {
  const [alternatives, setAlternatives] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentCity) {
      fetchAlternatives();
    }
  }, [currentCity, currentPlaceId]);

  const fetchAlternatives = async () => {
    setLoading(true);
    let query = supabase
      .from('places')
      .select('*')
      .eq('city', currentCity)
      .in('crowd_status', ['low', 'medium'])
      .order('crowd_percentage', { ascending: true })
      .limit(6);

    if (currentPlaceId) {
      query = query.neq('id', currentPlaceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching alternatives:', error);
    } else {
      setAlternatives(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-success" />
        <h3 className="text-xl font-semibold">Less Crowded Alternatives</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alternatives.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={place.image_urls?.[0] || '/placeholder.svg'}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {place.is_hidden_gem && (
                  <Badge className="absolute top-2 right-2 bg-primary/90">
                    Hidden Gem
                  </Badge>
                )}
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-success/90 text-success-foreground">
                    {place.crowd_percentage}% Crowd
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-lg">{place.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {place.city}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {place.description}
                </p>

                <Button
                  onClick={() => navigate(`/place/${place.id}`)}
                  className="w-full"
                  variant="outline"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
