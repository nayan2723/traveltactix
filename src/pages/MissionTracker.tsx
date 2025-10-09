import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainNav } from '@/components/MainNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MissionVerificationModal } from '@/components/MissionVerificationModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Target, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  Camera,
  MapPinned
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  city: string;
  country: string;
  deadline: string;
  latitude: number;
  longitude: number;
}

interface UserMission {
  id: string;
  progress: number;
  total_required: number;
  is_completed: boolean;
  verification_status: string;
  verification_type: string;
  started_at: string;
  completed_at: string | null;
}

export default function MissionTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [userMission, setUserMission] = useState<UserMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationOpen, setVerificationOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMissionData();
  }, [id, user]);

  const fetchMissionData = async () => {
    if (!id || !user) return;

    try {
      // Fetch mission details
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (missionError) throw missionError;
      setMission(missionData);

      // Fetch user's mission progress
      const { data: userMissionData, error: userMissionError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('mission_id', id)
        .eq('user_id', user.id)
        .single();

      if (userMissionError && userMissionError.code !== 'PGRST116') {
        throw userMissionError;
      }
      
      setUserMission(userMissionData);
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mission details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySuccess = () => {
    setVerificationOpen(false);
    fetchMissionData();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'hard':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPinned className="h-5 w-5" />;
      case 'photo':
        return <Camera className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading mission...</div>
        </div>
      </div>
    );
  }

  if (!mission || !userMission) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 pt-24">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Mission not found or not started</p>
              <Button onClick={() => navigate('/missions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Missions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = (userMission.progress / userMission.total_required) * 100;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/missions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missions
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Mission Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                      <Badge variant="outline">{mission.category}</Badge>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl mb-2">
                      {mission.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{mission.description}</p>
                  </div>
                  {userMission.is_completed && (
                    <CheckCircle2 className="h-12 w-12 text-success flex-shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{mission.city}, {mission.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-travel-gold" />
                    <span className="font-semibold">{mission.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(mission.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Started {new Date(userMission.started_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mission Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-semibold">
                      {userMission.progress} / {userMission.total_required}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    {getVerificationIcon(userMission.verification_type)}
                    <span className="text-muted-foreground">
                      Verification: <span className="capitalize">{userMission.verification_type}</span>
                    </span>
                  </div>
                  <Badge 
                    variant={
                      userMission.verification_status === 'verified' 
                        ? 'default' 
                        : userMission.verification_status === 'pending'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {userMission.verification_status}
                  </Badge>
                </div>

                {!userMission.is_completed && (
                  <Button
                    onClick={() => setVerificationOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Verify Mission Completion
                  </Button>
                )}

                {userMission.is_completed && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="font-semibold text-success">Mission Completed!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completed on {new Date(userMission.completed_at!).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-travel-gold mt-2">
                      +{mission.xp_reward} XP Earned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Verification Modal */}
      <MissionVerificationModal
        isOpen={verificationOpen}
        onClose={() => setVerificationOpen(false)}
        userMissionId={userMission.id}
        missionTitle={mission.title}
        verificationType={userMission.verification_type as 'location' | 'photo' | 'checkin' | 'quiz'}
        missionLocation={
          mission.latitude && mission.longitude
            ? { latitude: mission.latitude, longitude: mission.longitude }
            : undefined
        }
        xpReward={mission.xp_reward}
        onSuccess={handleVerifySuccess}
      />
    </div>
  );
}
