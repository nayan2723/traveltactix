import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Place {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  crowd_status: string;
  crowd_percentage: number;
}

interface CrowdMapLeafletProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

// Component to fit map bounds to markers
const FitBounds = ({ places }: { places: Place[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (places.length > 0) {
      const validPlaces = places.filter(p => p.latitude && p.longitude);
      if (validPlaces.length > 0) {
        const bounds: LatLngExpression[] = validPlaces.map(p => [p.latitude, p.longitude] as LatLngExpression);
        map.fitBounds(bounds as any, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [places, map]);
  
  return null;
};

const CrowdMapLeaflet = ({ places, onPlaceClick }: CrowdMapLeafletProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const getCrowdColor = (status: string) => {
    switch (status) {
      case 'low': return { fill: 'hsl(142, 76%, 36%)', stroke: 'hsl(142, 72%, 29%)' };
      case 'medium': return { fill: 'hsl(45, 93%, 47%)', stroke: 'hsl(45, 93%, 41%)' };
      case 'high': return { fill: 'hsl(0, 84%, 60%)', stroke: 'hsl(0, 72%, 51%)' };
      default: return { fill: 'hsl(0, 0%, 45%)', stroke: 'hsl(0, 0%, 35%)' };
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

  const getRadius = (percentage: number) => {
    return Math.max(10, Math.min(30, percentage / 3));
  };

  const validPlaces = places.filter(p => p.latitude && p.longitude);
  
  const defaultCenter: LatLngExpression = validPlaces.length > 0 
    ? [validPlaces[0].latitude, validPlaces[0].longitude]
    : [20, 0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && mapContainerRef.current) {
      mapContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur overflow-hidden" ref={mapContainerRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Crowd Heat Map
          </h3>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Legend - horizontal on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success" />
                <span className="text-muted-foreground hidden sm:inline">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-warning" />
                <span className="text-muted-foreground hidden sm:inline">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground hidden sm:inline">High</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 touch-manipulation"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Leaflet Map with improved touch support */}
        <div className={`rounded-xl overflow-hidden ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[300px] sm:h-[400px] md:h-[500px]'}`}>
          {validPlaces.length > 0 ? (
            <MapContainer
              {...{ center: defaultCenter, zoom: 4, dragging: true, touchZoom: true, scrollWheelZoom: true }}
              style={{ height: '100%', width: '100%' }}
              className="z-0 touch-pan-x touch-pan-y"
            >
              <TileLayer
                {...{ 
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }}
              />
              <FitBounds places={validPlaces} />
              
              {validPlaces.map((place) => {
                const colors = getCrowdColor(place.crowd_status);
                const radius = getRadius(place.crowd_percentage);
                const position: LatLngExpression = [place.latitude, place.longitude];
                
                return (
                  <CircleMarker
                    key={place.id}
                    {...{ 
                      center: position,
                      radius: radius,
                      pathOptions: {
                        fillColor: colors.fill,
                        fillOpacity: 0.6,
                        color: colors.stroke,
                        weight: 2,
                      }
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedPlace(place);
                        onPlaceClick?.(place);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[180px] sm:min-w-[200px]">
                        <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{place.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{place.city}</p>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            style={{ 
                              backgroundColor: `${colors.fill}20`,
                              borderColor: colors.fill,
                              color: colors.fill
                            }}
                            className="text-xs"
                          >
                            {getCrowdLabel(place.crowd_status)}
                          </Badge>
                          <span className="text-xs sm:text-sm font-medium">{place.crowd_percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${place.crowd_percentage}%`,
                                backgroundColor: colors.fill
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/50 rounded-xl">
              <div className="text-center text-muted-foreground px-4">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No location data available</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Selected Place Details - Mobile optimized */}
      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 md:p-6 bg-card/50 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-base sm:text-lg">{selectedPlace.name}</h4>
                <p className="text-muted-foreground text-sm">{selectedPlace.city}</p>
              </div>
              <Badge
                variant="outline"
                className="px-3 py-1 self-start"
                style={{ 
                  backgroundColor: `${getCrowdColor(selectedPlace.crowd_status).fill}20`,
                  borderColor: getCrowdColor(selectedPlace.crowd_status).fill,
                  color: getCrowdColor(selectedPlace.crowd_status).fill
                }}
              >
                {getCrowdLabel(selectedPlace.crowd_status)} ({selectedPlace.crowd_percentage}%)
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Last updated: Just now</span>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CrowdMapLeaflet;
