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
  Compass,
  Flame,
  Crown,
  Globe,
  Camera,
  Zap,
  Heart,
  Mountain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import compassIcon from "@/assets/compass-icon.png";
import treasureBadges from "@/assets/treasure-badges.png";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    xp: 2650,
    level: 8,
    xpToNext: 1350,
    missionsCompleted: 47,
    badgesEarned: 15,
    placesVisited: 28,
    rank: 23,
    streak: 12
  });
  
  const [missions] = useState([
    {
      id: 1,
      title: "Temple Mystic Quest",
      description: "Discover the ancient secrets of 3 sacred temples in Kyoto",
      progress: 2,
      total: 3,
      xp: 250,
      difficulty: "Legendary",
      timeLeft: "2 days",
      category: "cultural"
    },
    {
      id: 2,
      title: "Street Food Alchemist",
      description: "Master the art of 5 traditional street foods in Bangkok's hidden markets",
      progress: 3,
      total: 5,
      xp: 300,
      difficulty: "Epic",
      timeLeft: "5 days",
      category: "food"
    },
    {
      id: 3,
      title: "Linguistic Voyager",
      description: "Unlock 15 essential phrases in the ancient local dialect",
      progress: 11,
      total: 15,
      xp: 180,
      difficulty: "Mythic",
      timeLeft: "1 week",
      category: "language"
    }
  ]);

  const [recentAchievements] = useState([
    { name: "Culture Whisperer", description: "Mastered 15 cultural customs", type: "gold", unlocked: true, date: "2 days ago" },
    { name: "Temple Guardian", description: "Visited 25 sacred temples", type: "silver", unlocked: true, date: "1 week ago" },
    { name: "Street Food Legend", description: "Tried 50 local delicacies", type: "gold", unlocked: true, date: "2 weeks ago" },
    { name: "Language Sage", description: "Learned phrases in 5 languages", type: "bronze", unlocked: true, date: "3 weeks ago" }
  ]);

  const [weeklyLeaders] = useState([
    { name: "Aurora Chen", xp: 4250, rank: 1, avatar: "🏆", country: "🇯🇵" },
    { name: "Marco Silva", xp: 3890, rank: 2, avatar: "⭐", country: "🇧🇷" },
    { name: "You", xp: userStats.xp, rank: userStats.rank, avatar: "🌟", country: "🌍" },
    { name: "Emma Rodriguez", xp: 2420, rank: 24, avatar: "💫", country: "🇪🇸" },
    { name: "Kai Nakamura", xp: 2380, rank: 25, avatar: "✨", country: "🇯🇵" }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Epic": return "border-secondary text-secondary bg-secondary/10";
      case "Legendary": return "border-accent text-accent bg-accent/10";
      case "Mythic": return "border-primary text-primary bg-primary/10";
      default: return "border-success text-success bg-success/10";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cultural": return Star;
      case "food": return Heart;
      case "language": return Globe;
      default: return Target;
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Epic Header */}
      <header className="nav-wanderlust border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={compassIcon} alt="Quest Voyage" className="w-10 h-10" />
              <h1 className="heading-display text-2xl text-primary">Quest Voyage</h1>
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Level {userStats.level}
                </Badge>
                <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                  <Flame className="h-3 w-3 mr-1" />
                  {userStats.streak} Day Streak
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="text-foreground font-medium">
                  Welcome back, {user.user_metadata?.full_name || "Adventurer"}!
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">
                  #{userStats.rank} Global
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Adventure Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Epic Stats Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
                <div className="relative">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="heading-display text-3xl text-primary mb-1">{userStats.xp.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Epic XP</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/10"></div>
                <div className="relative">
                  <Target className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <div className="heading-display text-3xl text-secondary mb-1">{userStats.missionsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Quests Conquered</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10"></div>
                <div className="relative">
                  <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="heading-display text-3xl text-accent mb-1">{userStats.badgesEarned}</div>
                  <div className="text-sm text-muted-foreground">Legendary Badges</div>
                </div>
              </Card>
              
              <Card className="stats-card p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10"></div>
                <div className="relative">
                  <MapPin className="h-8 w-8 text-success mx-auto mb-3" />
                  <div className="heading-display text-3xl text-success mb-1">{userStats.placesVisited}</div>
                  <div className="text-sm text-muted-foreground">Realms Explored</div>
                </div>
              </Card>
            </div>

            {/* Legendary Level Progress */}
            <Card className="travel-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="heading-display text-2xl mb-2">Adventure Progression</h3>
                  <p className="text-muted-foreground">Ascend to legendary status</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
                    <Mountain className="h-3 w-3 mr-1" />
                    Global Rank #{userStats.rank}
                  </Badge>
                  <div className="text-sm text-muted-foreground">Top 1% Adventurer</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Level {userStats.level} - Master Explorer</span>
                  <span className="text-muted-foreground">{userStats.xp} / {userStats.xp + userStats.xpToNext} XP</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} 
                    className="h-4 xp-bar"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 animate-shimmer"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-medium">
                    {userStats.xpToNext} XP to Level {userStats.level + 1}
                  </span>
                  <span className="text-secondary">
                    🔥 {userStats.streak} day streak
                  </span>
                </div>
              </div>
            </Card>

            {/* Epic Active Quests */}
            <Card className="travel-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="heading-display text-2xl mb-2">Active Legendary Quests</h3>
                  <p className="text-muted-foreground">Your path to glory awaits</p>
                </div>
                <Button className="btn-adventure group">
                  <Compass className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Discover New Quests
                </Button>
              </div>
              
              <div className="space-y-6">
                {missions.map((mission) => {
                  const IconComponent = getCategoryIcon(mission.category);
                  return (
                    <Card key={mission.id} className="mission-card p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{mission.title}</h4>
                              <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                                {mission.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {mission.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(mission.progress / mission.total) * 100} 
                                className="flex-1 h-2"
                              />
                              <span className="text-muted-foreground whitespace-nowrap">
                                {mission.progress}/{mission.total}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-primary">
                              <Trophy className="h-4 w-4" />
                              <span className="font-medium">{mission.xp} XP</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{mission.timeLeft}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button size="sm" className="ml-6 btn-adventure">
                          Continue Quest
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Legendary Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="travel-card p-6">
              <h3 className="heading-display text-lg mb-4">Quest Commands</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start group hover:bg-primary/5">
                  <Map className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
                  Plan Epic Journey
                </Button>
                <Button variant="outline" className="w-full justify-start group hover:bg-secondary/5">
                  <Star className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  Cultural Wisdom
                </Button>
                <Button variant="outline" className="w-full justify-start group hover:bg-accent/5">
                  <Users className="h-4 w-4 mr-3 group-hover:animate-bounce" />
                  Find Quest Companions
                </Button>
                <Button variant="outline" className="w-full justify-start group hover:bg-success/5">
                  <Camera className="h-4 w-4 mr-3 group-hover:rotate-45 transition-transform" />
                  Memory Vault
                </Button>
              </div>
            </Card>

            {/* Recent Legendary Achievements */}
            <Card className="travel-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <img src={treasureBadges} alt="Achievements" className="w-8 h-8 rounded" />
                <h3 className="heading-display text-lg">Recent Legends</h3>
              </div>
              <div className="space-y-4">
                {recentAchievements.slice(0, 4).map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 achievement-glow p-2 rounded-lg">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                      ${badge.type === 'gold' ? 'badge-gold' : 
                        badge.type === 'silver' ? 'badge-silver' : 'badge-bronze'}
                    `}>
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </div>
                      <div className="text-xs text-accent mt-1">{badge.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Global Adventurer Leaderboard */}
            <Card className="travel-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-5 w-5 text-secondary" />
                <h3 className="heading-display text-lg">Weekly Champions</h3>
              </div>
              <div className="space-y-3">
                {weeklyLeaders.map((player, index) => (
                  <div key={index} className={`
                    flex items-center justify-between p-3 rounded-lg transition-colors
                    ${player.name === 'You' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
                  `}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold">#{player.rank}</span>
                        <span className="text-lg">{player.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium flex items-center space-x-1">
                          <span>{player.name}</span>
                          <span>{player.country}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{player.xp} XP</div>
                      </div>
                    </div>
                    {player.name === 'You' && (
                      <Badge className="bg-primary/10 text-primary text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        You
                      </Badge>
                    )}
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