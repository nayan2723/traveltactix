import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingDown, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BestVisitTime {
  day: string;
  hours: string;
  crowd_level: string;
}

interface Place {
  id: string;
  name: string;
  city: string;
  crowd_status: string;
  crowd_percentage: number;
  best_visit_times: BestVisitTime[] | null;
  last_crowd_update: string | null;
}

export const CrowdDashboard = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces();
    
    // Auto-refresh every 2 minutes for real-time updates
    const interval = setInterval(() => {
      fetchPlaces();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('crowd_percentage', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching places:', error);
      toast.error('Failed to load places');
      setLoading(false);
      return;
    }

    setPlaces((data as any) || []);
    setLoading(false);

    // Fetch real-time crowd data for each place in background
    if (data && data.length > 0) {
      data.forEach(async (place: any) => {
        try {
          await supabase.functions.invoke('fetch-crowd-data', {
            body: { placeId: place.id }
          });
        } catch (err) {
          console.error(`Failed to update crowd data for ${place.name}:`, err);
        }
      });
      
      // Refresh places after crowd data is fetched
      setTimeout(() => {
        supabase
          .from('places')
          .select('*')
          .order('crowd_percentage', { ascending: false })
          .limit(10)
          .then(({ data: updatedData }) => {
            if (updatedData) setPlaces(updatedData as any);
          });
      }, 5000);
    }
  };

  const refreshCrowdData = async (placeId: string) => {
    setRefreshing(placeId);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-crowd-data', {
        body: { placeId }
      });

      if (error) throw error;

      toast.success('Crowd data updated');
      fetchPlaces();
    } catch (error) {
      console.error('Error refreshing crowd data:', error);
      toast.error('Failed to refresh crowd data');
    } finally {
      setRefreshing(null);
    }
  };

  const getCrowdVariant = (status: string) => {
    switch (status) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getCrowdIcon = (status: string) => {
    switch (status) {
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Crowd Status</h2>
        <Button onClick={fetchPlaces} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <div className="grid gap-4">
        {places.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{place.name}</h3>
                  <p className="text-sm text-muted-foreground">{place.city}</p>
                </div>
                <Badge variant={getCrowdVariant(place.crowd_status)} className="flex items-center gap-1">
                  {getCrowdIcon(place.crowd_status)}
                  {place.crowd_status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Crowd</span>
                    <span className="text-sm font-medium">{place.crowd_percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 bg-primary"
                      style={{ width: `${place.crowd_percentage}%` }}
                    />
                  </div>
                </div>

                {place.best_visit_times && place.best_visit_times.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Best Visit Times</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {place.best_visit_times.slice(0, 4).map((time, idx) => (
                        <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                          <div className="font-medium">{time.day}</div>
                          <div className="text-muted-foreground">{time.hours}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {place.last_crowd_update 
                      ? new Date(place.last_crowd_update).toLocaleTimeString() 
                      : 'Never'}
                  </span>
                  <Button
                    onClick={() => refreshCrowdData(place.id)}
                    disabled={refreshing === place.id}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing === place.id ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
