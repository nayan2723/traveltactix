import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Place {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  crowd_status: string;
  crowd_percentage: number;
}

interface CrowdMapProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

export const CrowdMap = ({ places, onPlaceClick }: CrowdMapProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const getCrowdColor = (status: string) => {
    switch (status) {
      case 'low': return 'hsl(var(--success))';
      case 'medium': return 'hsl(var(--warning))';
      case 'high': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getCrowdLabel = (status: string) => {
    switch (status) {
      case 'low': return 'Low Crowd';
      case 'medium': return 'Medium Crowd';
      case 'high': return 'High Crowd';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card/50 backdrop-blur">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Crowd Heat Map
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border-2"
                style={{ borderColor: getCrowdColor(place.crowd_status) }}
                onClick={() => {
                  setSelectedPlace(place);
                  onPlaceClick?.(place);
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{place.name}</h4>
                      <p className="text-sm text-muted-foreground">{place.city}</p>
                    </div>
                    <Badge
                      variant="outline"
                      style={{ 
                        backgroundColor: `${getCrowdColor(place.crowd_status)}20`,
                        borderColor: getCrowdColor(place.crowd_status),
                        color: getCrowdColor(place.crowd_status)
                      }}
                    >
                      {getCrowdLabel(place.crowd_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${place.crowd_percentage}%`,
                          backgroundColor: getCrowdColor(place.crowd_status)
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium">{place.crowd_percentage}%</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Last updated: Just now
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h4 className="font-semibold mb-2">{selectedPlace.name}</h4>
            <p className="text-sm text-muted-foreground">
              Current crowd level: {getCrowdLabel(selectedPlace.crowd_status)} ({selectedPlace.crowd_percentage}%)
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
