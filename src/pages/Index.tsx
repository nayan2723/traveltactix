import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Trophy, 
  Compass,
  Globe,
  Mountain,
  Plane,
  Heart,
  Sparkles,
  Map,
  BookOpen,
  Camera,
  Zap,
  Users,
  TrendingUp,
  Award,
  Brain,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@/assets/hero-adventure.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Discovery",
      description: "Get personalized destination recommendations based on your travel style and preferences using advanced AI",
      route: "/discovery",
      badge: "Smart Recommendations",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Map,
      title: "Smart Itinerary Builder",
      description: "AI creates perfect multi-day itineraries balancing popular spots and hidden gems for your perfect trip",
      route: "/discovery",
      badge: "Trip Planning",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Trophy,
      title: "Gamified Missions",
      description: "Complete exciting cultural challenges, earn XP points, and unlock exclusive badges as you explore",
      route: "/missions",
      badge: "Achievements",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Cultural Lessons",
      description: "Master local customs, phrases, and traditions through interactive lessons before you travel",
      route: "/cultural-lessons",
      badge: "Learn Culture",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Globe,
      title: "Cultural Feed",
      description: "Discover daily cultural insights, local tips, and authentic experiences from around the world",
      route: "/cultural-feed",
      badge: "Daily Content",
      color: "from-rose-500 to-red-500"
    },
    {
      icon: Camera,
      title: "AR Scanning",
      description: "Point your camera at landmarks to unlock hidden stories, historical facts, and cultural significance",
      route: "/ar-scan",
      badge: "Augmented Reality",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Heart,
      title: "Favorites Collection",
      description: "Save your dream destinations and create personal travel bucket lists with notes and memories",
      route: "/favorites",
      badge: "Wishlist",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: TrendingUp,
      title: "Your Dashboard",
      description: "Track your XP, level progress, completed missions, and achievements in your personalized hub",
      route: "/dashboard",
      badge: "Progress Tracking",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { icon: Users, value: "33+", label: "Places", color: "text-cyan-500" },
    { icon: MapPin, value: "India", label: "Country Focus", color: "text-purple-500" },
    { icon: Trophy, value: "500+", label: "Missions", color: "text-amber-500" },
    { icon: Award, value: "Free", label: "To Start", color: "text-emerald-500" }
  ];

  const howItWorks = [
    {
      step: "01",
      icon: Compass,
      title: "Sign Up & Explore",
      description: "Create your account and start discovering hidden gems across India with AI-powered recommendations"
    },
    {
      step: "02",
      icon: Target,
      title: "Complete Missions",
      description: "Take on cultural challenges, learn local customs, and earn XP points as you explore new destinations"
    },
    {
      step: "03",
      icon: Brain,
      title: "Build Itineraries",
      description: "Let AI craft perfect trip plans combining offbeat locations and must-see attractions"
    },
    {
      step: "04",
      icon: Award,
      title: "Level Up & Achieve",
      description: "Climb levels, unlock badges, and become a cultural explorer master with every journey"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Modern Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Quest Voyage</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-smooth">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-smooth">How It Works</a>
              <Button variant="ghost" onClick={() => navigate("/discovery")}>
                Explore Places
              </Button>
              <ThemeToggle />
              <Button className="bg-gradient-to-r from-primary to-secondary text-white" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
            
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern & Clean */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float opacity-50" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
            <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 px-6 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Discover India's Hidden Treasures
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Travel Smarter with
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-scale-in">
                AI-Powered Quests
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your travels into epic adventures. Get personalized recommendations, 
              complete cultural missions, and unlock achievements as you explore.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg px-8 py-6 rounded-xl shadow-glow group transition-smooth"
                onClick={() => navigate("/auth")}
              >
                <Plane className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 rounded-xl border-2 hover-lift"
                onClick={() => navigate("/discovery")}
              >
                <Map className="mr-2 h-5 w-5" />
                Explore Places
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-xl hover-lift transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              <Zap className="h-4 w-4 mr-2 inline" />
              Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything You Need
              <span className="block gradient-text">For Epic Adventures</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our comprehensive suite of features designed to make every journey unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer hover-lift bg-card/50 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(feature.route)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <Badge className="mb-3 text-xs bg-muted">{feature.badge}</Badge>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-2 transition-transform">
                    Explore Feature
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clean Steps */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Target className="h-4 w-4 mr-2 inline" />
              Simple Process
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              How It
              <span className="block gradient-text">Actually Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four simple steps to transform your travels into epic adventures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorks.map((item, index) => (
              <div 
                key={index}
                className="relative group animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Connecting line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2 z-0" />
                )}
                
                <Card className="relative p-8 text-center hover-lift transition-smooth bg-card/50 backdrop-blur-sm border-2 group-hover:border-primary/50 z-10">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-glow">
                    {item.step}
                  </div>
                  
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-6 py-2 animate-glow">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Ready to Explore?
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Adventure
              <span className="block gradient-text">Starts Now</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of travelers discovering India's hidden gems through gamified exploration
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary text-white text-lg px-10 py-6 rounded-xl shadow-glow hover:opacity-90 transition-smooth group"
                onClick={() => navigate("/auth")}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Begin Your Quest
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-6 rounded-xl border-2"
                onClick={() => navigate("/discovery")}
              >
                <Globe className="mr-2 h-5 w-5" />
                Browse Destinations
              </Button>
            </div>
            
            <div className="mt-8 text-muted-foreground text-sm">
              ✨ Free to start • 🌍 33+ Places in India • 🏆 500+ Missions
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Quest Voyage</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/discovery")} className="hover:text-primary transition-smooth">Discover</button>
              <button onClick={() => navigate("/missions")} className="hover:text-primary transition-smooth">Missions</button>
              <button onClick={() => navigate("/cultural-lessons")} className="hover:text-primary transition-smooth">Learn</button>
              <button onClick={() => navigate("/dashboard")} className="hover:text-primary transition-smooth">Dashboard</button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 text-rose-500 inline" /> for travelers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;