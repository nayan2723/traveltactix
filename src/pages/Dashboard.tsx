import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Map, 
  Star, 
  Settings, 
  LogOut, 
  MapPin, 
  Calendar,
  Users,
  Target,
  Award,
  Compass
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    xp: 1250,
    level: 5,
    xpToNext: 750,
    missionsCompleted: 23,
    badgesEarned: 8,
    placesVisited: 15,
    rank: 142
  });
  
  const [missions] = useState([
    {
      id: 1,
      title: "Temple Explorer",
      description: "Visit 3 traditional temples in Kyoto",
      progress: 2,
      total: 3,
      xp: 150,
      difficulty: "Medium",
      timeLeft: "2 days"
    },
    {
      id: 2,
      title: "Street Food Master",
      description: "Try 5 local street foods in Bangkok",
      progress: 1,
      total: 5,
      xp: 200,
      difficulty: "Easy",
      timeLeft: "5 days"
    },
    {
      id: 3,
      title: "Cultural Ambassador",
      description: "Learn 10 basic phrases in local language",
      progress: 7,
      total: 10,
      xp: 100,
      difficulty: "Hard",
      timeLeft: "1 week"
    }
  ]);

  const [badges] = useState([
    { name: "First Steps", description: "Completed your first mission", type: "bronze", unlocked: true },
    { name: "Culture Seeker", description: "Visited 10 cultural sites", type: "silver", unlocked: true },
    { name: "Foodie Explorer", description: "Tried 25 local dishes", type: "gold", unlocked: true },
    { name: "Language Learner", description: "Learned phrases in 3 languages", type: "bronze", unlocked: true },
    { name: "Hidden Gem Finder", description: "Discovered 5 off-beat locations", type: "silver", unlocked: false },
    { name: "Master Explorer", description: "Reached Level 10", type: "gold", unlocked: false }
  ]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-primary">Loading your adventure...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Quest Voyage</h1>
              <Badge variant="outline" className="bg-primary/10">
                Level {userStats.level}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
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
              <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{userStats.xp}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5">
                <Target className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{userStats.missionsCompleted}</div>
                <div className="text-sm text-muted-foreground">Missions Done</div>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5">
                <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">{userStats.badgesEarned}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
                <MapPin className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">{userStats.placesVisited}</div>
                <div className="text-sm text-muted-foreground">Places Visited</div>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Level Progress</h3>
                <Badge className="bg-primary/10 text-primary">
                  Rank #{userStats.rank}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {userStats.level}</span>
                  <span>{userStats.xp} / {userStats.xp + userStats.xpToNext} XP</span>
                </div>
                <Progress 
                  value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} 
                  className="h-3"
                />
                <div className="text-sm text-muted-foreground">
                  {userStats.xpToNext} XP to Level {userStats.level + 1}
                </div>
              </div>
            </Card>

            {/* Active Missions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Active Missions</h3>
                <Button variant="outline" size="sm">
                  <Compass className="h-4 w-4 mr-2" />
                  Browse All
                </Button>
              </div>
              
              <div className="space-y-4">
                {missions.map((mission) => (
                  <Card key={mission.id} className="mission-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{mission.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={
                              mission.difficulty === "Easy" ? "border-success text-success" :
                              mission.difficulty === "Medium" ? "border-warning text-warning" :
                              "border-destructive text-destructive"
                            }
                          >
                            {mission.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3">
                          {mission.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(mission.progress / mission.total) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-muted-foreground">
                              {mission.progress}/{mission.total}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-primary">
                            <Trophy className="h-3 w-3" />
                            <span>{mission.xp} XP</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{mission.timeLeft}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button size="sm" className="ml-4">
                        Continue
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Map className="h-4 w-4 mr-2" />
                  Plan Trip
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Cultural Tips
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Travel Buddies
                </Button>
              </div>
            </Card>

            {/* Recent Badges */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Badges</h3>
              <div className="space-y-3">
                {badges.filter(badge => badge.unlocked).slice(0, 4).map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${badge.type === 'gold' ? 'badge-gold' : 
                        badge.type === 'silver' ? 'badge-silver' : 'badge-bronze'}
                    `}>
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Leaderboard */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">This Week's Leaders</h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Chen", xp: 2840, rank: 1 },
                  { name: "Sarah Wilson", xp: 2650, rank: 2 },
                  { name: "Mike Rodriguez", xp: 2430, rank: 3 },
                  { name: "You", xp: userStats.xp, rank: userStats.rank }
                ].map((player, index) => (
                  <div key={index} className={`
                    flex items-center justify-between p-2 rounded 
                    ${player.name === 'You' ? 'bg-primary/10' : ''}
                  `}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">#{player.rank}</span>
                      <span className="text-sm">{player.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{player.xp} XP</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;