import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlaceResult {
  place_id: string;
  name: string;
  city: string;
  crowd_percentage: number;
  crowd_status: string;
  best_visit_times?: any[];
  best_months?: { month: string; reason: string; crowd_level: string }[];
  avoid_months?: { month: string; reason: string }[];
}

interface SearchResult {
  target_place: PlaceResult;
  similar_places: PlaceResult[];
}

export const CrowdRecommendations = () => {
  const [results, setResults] = useState<SearchResult | null>(null);

  const getCrowdColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCrowdBgColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-green-500/10 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold">Real-Time Crowd Monitor</h2>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Target Place */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Your Search Result
              </h3>
              <Card className={`p-6 border-2 ${getCrowdBgColor(results.target_place.crowd_status)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-2xl">{results.target_place.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {results.target_place.city}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className={`w-5 h-5 ${getCrowdColor(results.target_place.crowd_status)}`} />
                        <span className={`font-semibold text-lg ${getCrowdColor(results.target_place.crowd_status)}`}>
                          {results.target_place.crowd_status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-3xl font-bold">
                        {results.target_place.crowd_percentage}%
                      </div>
                      <span className="text-sm text-muted-foreground">crowded</span>
                    </div>

                    {/* Best Times of Day */}
                    {results.target_place.best_visit_times && results.target_place.best_visit_times.length > 0 && (
                      <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                        <p className="text-sm font-semibold mb-3">🕐 Best Times of Day:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {results.target_place.best_visit_times.slice(0, 7).map((time: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1 p-2 bg-primary/5 rounded">
                              <span className="font-medium text-primary">{time.day}</span>
                              <span className="text-xs text-muted-foreground">{time.hours}</span>
                              <Badge variant="outline" className="text-xs w-fit">
                                {time.crowd_level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best Months */}
                    {results.target_place.best_months && results.target_place.best_months.length > 0 && (
                      <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="text-lg">🌟</span>
                          Best Months to Visit
                        </p>
                        <div className="space-y-2">
                          {results.target_place.best_months.map((month: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0 bg-green-500/10">
                                {month.month}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{month.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Months to Avoid */}
                    {results.target_place.avoid_months && results.target_place.avoid_months.length > 0 && (
                      <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          Months to Avoid
                        </p>
                        <div className="space-y-2">
                          {results.target_place.avoid_months.map((month: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0 bg-red-500/10">
                                {month.month}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{month.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Similar Places */}
            {results.similar_places.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Similar Places Nearby ({results.similar_places.length})
                </h3>
                <div className="grid gap-4">
                  {results.similar_places.map((place, idx) => (
                    <motion.div
                      key={place.place_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{place.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {place.city}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Users className={`w-4 h-4 ${getCrowdColor(place.crowd_status)}`} />
                                <span className={`text-sm font-medium ${getCrowdColor(place.crowd_status)}`}>
                                  {place.crowd_status.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xl font-bold">{place.crowd_percentage}%</span>
                                <span className="text-xs text-muted-foreground">crowded</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </Card>
    </div>
  );
};
