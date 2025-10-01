import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ItineraryDay {
  day: number;
  theme: string;
  activities: {
    time: string;
    place_id: string;
    place_name: string;
    duration: number;
    description: string;
    tips: string[];
  }[];
}

interface Itinerary {
  itinerary: ItineraryDay[];
  overview: string;
  tips: string[];
}

interface ItineraryBuilderProps {
  selectedPlaceIds: string[];
}

export const ItineraryBuilder = ({ selectedPlaceIds }: ItineraryBuilderProps) => {
  const { toast } = useToast();
  const [days, setDays] = useState<number>(3);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);

  const generateItinerary = async () => {
    if (selectedPlaceIds.length === 0) {
      toast({
        title: "No Places Selected",
        description: "Please select at least one place to build an itinerary",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-itinerary', {
        body: { 
          placeIds: selectedPlaceIds,
          days: days,
          preferences: {}
        }
      });

      if (error) throw error;

      setItinerary(data);
      
      toast({
        title: "Itinerary Generated!",
        description: `Your ${days}-day adventure is ready`,
      });
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate itinerary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            AI Itinerary Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Number of Days
              </label>
              <Input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={generateItinerary} 
              disabled={loading || selectedPlaceIds.length === 0}
              className="mt-6 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Generating..." : "Generate Itinerary"}
            </Button>
          </div>

          {selectedPlaceIds.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedPlaceIds.length} place{selectedPlaceIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {itinerary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{itinerary.overview}</p>
              <div className="space-y-2">
                <p className="font-semibold text-sm">General Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Daily Itinerary */}
          {itinerary.itinerary.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Day {day.day}
                  </CardTitle>
                  <Badge>{day.theme}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.activities.map((activity, i) => (
                  <div key={i} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {activity.time}
                        </p>
                        <p className="font-bold text-lg">{activity.place_name}</p>
                      </div>
                      <Badge variant="outline">
                        {activity.duration} min
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </p>

                    {activity.tips.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.tips.map((tip, j) => (
                            <li key={j} className="text-xs text-muted-foreground">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
};
