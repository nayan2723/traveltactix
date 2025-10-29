import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Recommendation {
  mission_id: string;
  reason: string;
  fit_score: number;
  mission: any;
}

export const MissionRecommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-missions', {
        body: { 
          latitude: null,
          longitude: null,
          timeAvailable: 120
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setUserStats(data.user_stats || null);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const startMission = async (missionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_missions').insert({
        user_id: user.id,
        mission_id: missionId,
        progress: 0,
        total_required: 1,
        verification_type: 'location',
        verification_status: 'saved',
      });

      if (error) throw error;

      toast.success('Mission added to your list!');
      navigate(`/missions/${missionId}`);
    } catch (error) {
      console.error('Error starting mission:', error);
      toast.error('Failed to start mission');
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Personalized missions just for you
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {userStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">Level {userStats.level}</p>
            <p className="text-xs text-muted-foreground">Your Level</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{userStats.completion_rate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold capitalize">{userStats.preferred_category}</p>
            <p className="text-xs text-muted-foreground">Favorite</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Analyzing your profile...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No recommendations available yet. Complete some missions to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.mission_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{rec.mission.category}</Badge>
                      <Badge 
                        variant="outline"
                        className={
                          rec.fit_score >= 80 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : rec.fit_score >= 60
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            : 'bg-muted'
                        }
                      >
                        {rec.fit_score}% Match
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{rec.mission.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.mission.description}
                    </p>
                    <p className="text-xs text-primary mb-3">
                      ✨ {rec.reason}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{rec.mission.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{rec.mission.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startMission(rec.mission_id)}
                  >
                    Start
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};