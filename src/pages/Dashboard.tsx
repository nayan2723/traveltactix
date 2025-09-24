import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  MapPin, 
  Star, 
  Users, 
  Award,
  Settings,
  Compass,
  Flame,
  Crown,
  Mountain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import compassIcon from "@/assets/compass-icon.png";
import treasureBadges from "@/assets/treasure-badges.png";

const Dashboard = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<any[]>([]);
  const [userMissions, setUserMissions] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const mockProfile = {
    full_name: "Adventure Explorer",
    total_xp: 2450,
    level: 7,
    avatar_url: null
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch missions
      const { data: missionsData } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setMissions(missionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startMission = async (missionId: string) => {
    // Mock mission start
    toast({
      title: "Mission Started!",
      description: "Good luck on your new adventure!",
    });
    
    // Add to user missions locally
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setUserMissions(prev => [...prev, {
        id: Date.now().toString(),
        mission_id: missionId,
        progress: 0,
        total_required: 1,
        is_completed: false,
        missions: mission
      }]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center text-white">
          <Compass className="h-16 w-16 mx-auto mb-4 animate-spin" />
          <div className="heading-display text-3xl mb-2">Loading Your Epic Journey...</div>
          <div className="text-white/80">Preparing your adventure dashboard</div>
        </div>
      </div>
    );
  }

  const level = mockProfile.level;
  const currentXP = mockProfile.total_xp;
  const xpForNextLevel = level * 1000; // 1000 XP per level
  const xpProgress = (currentXP % 1000) / 10; // Progress to next level as percentage

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Header */}
      <header className="nav-wanderlust border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={compassIcon} alt="Quest Voyage" className="w-10 h-10" />
              <h1 className="heading-display text-2xl text-primary">Quest Voyage</h1>
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Level {level}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="text-foreground font-medium">
                  Welcome back, {mockProfile.full_name}!
                </div>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
                <div className="relative">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="heading-display text-3xl text-primary mb-1">{currentXP.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/10"></div>
                <div className="relative">
                  <Target className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <div className="heading-display text-3xl text-secondary mb-1">{userMissions.filter(m => !m.is_completed).length}</div>
                  <div className="text-sm text-muted-foreground">Active Missions</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10"></div>
                <div className="relative">
                  <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="heading-display text-3xl text-accent mb-1">{userBadges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10"></div>
                <div className="relative">
                  <MapPin className="h-8 w-8 text-success mx-auto mb-3" />
                  <div className="heading-display text-3xl text-success mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Places Visited</div>
                </div>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="travel-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="heading-display text-2xl mb-2">Adventure Progression</h3>
                  <p className="text-muted-foreground">Ascend to legendary status</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Level {level} - Explorer</span>
                  <span className="text-muted-foreground">{currentXP % 1000} / 1000 XP</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={xpProgress} 
                    className="h-4 xp-bar"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 animate-shimmer"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-medium">
                    {1000 - (currentXP % 1000)} XP to Level {level + 1}
                  </span>
                </div>
              </div>
            </Card>

            {/* Active Missions */}
            <Card className="travel-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="heading-display text-2xl mb-2">Your Active Quests</h3>
                  <p className="text-muted-foreground">Continue your adventure</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {userMissions.filter(m => !m.is_completed).length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h4 className="text-xl font-semibold mb-2">No Active Missions</h4>
                    <p className="text-muted-foreground mb-6">Start a new mission to begin your adventure!</p>
                  </div>
                ) : (
                  userMissions.filter(m => !m.is_completed).map((userMission) => (
                    <Card key={userMission.id} className="mission-card p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{userMission.missions?.title}</h4>
                              <Badge className="text-xs border-primary/20 bg-primary/10 text-primary">
                                {userMission.missions?.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {userMission.missions?.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(userMission.progress / userMission.total_required) * 100} 
                                className="flex-1 h-2"
                              />
                              <span className="text-muted-foreground whitespace-nowrap">
                                {userMission.progress}/{userMission.total_required}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-primary">
                              <Trophy className="h-4 w-4" />
                              <span className="font-medium">{userMission.missions?.xp_reward} XP</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button size="sm" className="ml-6 btn-adventure">
                          Continue Quest
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>

            {/* Available Missions */}
            <Card className="travel-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="heading-display text-2xl mb-2">Discover New Quests</h3>
                  <p className="text-muted-foreground">Start your next adventure</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {missions.filter(mission => 
                  !userMissions.some(um => um.mission_id === mission.id)
                ).slice(0, 4).map((mission) => (
                  <Card key={mission.id} className="mission-card p-6 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-travel-primary">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={mission.difficulty === 'Easy' ? 'secondary' : mission.difficulty === 'Medium' ? 'default' : 'destructive'}
                        >
                          {mission.difficulty}
                        </Badge>
                        <span className="text-sm font-medium text-travel-primary">{mission.xp_reward} XP</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => startMission(mission.id)}
                        className="btn-adventure"
                      >
                        Start Quest
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="travel-card p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-travel-primary to-travel-secondary flex items-center justify-center text-white text-xl font-bold">
                    {mockProfile.full_name[0]}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {mockProfile.level}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-travel-dark">{mockProfile.full_name}</h3>
                  <p className="text-travel-muted">Level {mockProfile.level} Adventurer</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-travel-muted">Progress to Level {mockProfile.level + 1}</span>
                  <span className="text-travel-dark font-medium">{mockProfile.total_xp} XP</span>
                </div>
                <div className="xp-bar w-full bg-travel-light rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-travel-primary to-travel-secondary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((mockProfile.total_xp % 1000) / 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Recent Achievements */}
            <Card className="travel-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <img src={treasureBadges} alt="Achievements" className="w-8 h-8 rounded" />
                <h3 className="heading-display text-lg">Recent Achievements</h3>
              </div>
              <div className="space-y-4">
                {userBadges.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground text-sm">No badges earned yet</p>
                    <p className="text-xs text-muted-foreground">Complete missions to earn badges!</p>
                  </div>
                ) : (
                  userBadges.slice(0, 3).map((userBadge) => (
                    <div key={userBadge.id} className="flex items-center space-x-3 achievement-glow p-2 rounded-lg">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 badge-gold">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{userBadge.badges?.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {userBadge.badges?.description}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="travel-card p-6">
              <h3 className="heading-display text-lg mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Missions Completed</span>
                  <span className="font-medium">{userMissions.filter(m => m.is_completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total XP Earned</span>
                  <span className="font-medium">{currentXP.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Level</span>
                  <span className="font-medium text-primary">Level {level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Rank</span>
                  <span className="font-medium text-secondary">#1,247</span>
                </div>
              </div>
            </Card>

            {/* Leaderboard Preview */}
            <Card className="travel-card p-6">
              <h3 className="heading-display text-lg mb-4">Global Leaderboard</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-yellow-900">1</div>
                    <span className="text-sm font-medium">Explorer Ace</span>
                  </div>
                  <span className="text-sm text-muted-foreground">15,240 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-gray-900">2</div>
                    <span className="text-sm font-medium">Quest Master</span>
                  </div>
                  <span className="text-sm text-muted-foreground">12,890 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">3</div>
                    <span className="text-sm font-medium">Journey Walker</span>
                  </div>
                  <span className="text-sm text-muted-foreground">10,340 XP</span>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between bg-primary/5 p-2 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">1247</div>
                    <span className="text-sm font-medium">{mockProfile.full_name}</span>
                  </div>
                  <span className="text-sm text-primary font-medium">{currentXP} XP</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;