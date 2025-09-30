import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Trophy, 
  Users, 
  Zap, 
  Compass,
  Camera,
  Globe,
  Mountain,
  Plane,
  Heart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import heroImage from "@/assets/hero-adventure.jpg";
import travelCollage from "@/assets/travel-collage.jpg";
import compassIcon from "@/assets/compass-icon.png";
import treasureBadges from "@/assets/treasure-badges.png";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Sarah Chen",
      location: "Tokyo, Japan",
      text: "Quest Voyage turned my solo trip to Japan into an epic adventure! I discovered hidden temples and earned the Cultural Ambassador badge.",
      rating: 5,
      achievement: "Temple Explorer Master"
    },
    {
      name: "Marcus Rodriguez",
      location: "Marrakech, Morocco",
      text: "The gamification made me explore places I'd never have found. Best travel app ever!",
      rating: 5,
      achievement: "Hidden Gem Finder"
    },
    {
      name: "Emma Thompson",
      location: "Bagan, Myanmar",
      text: "Learning local phrases through missions made my connections with locals so much deeper.",
      rating: 5,
      achievement: "Cultural Ambassador"
    }
  ];

  const stats = [
    { icon: Users, value: "75K+", label: "Global Adventurers", color: "text-primary" },
    { icon: MapPin, value: "300+", label: "Destinations", color: "text-secondary" },
    { icon: Trophy, value: "1M+", label: "Missions Completed", color: "text-accent" },
    { icon: Star, value: "500+", label: "Cultural Badges", color: "text-success" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Premium Navigation */}
      <nav className="nav-wanderlust fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={compassIcon} alt="Quest Voyage" className="w-10 h-10" />
              <h1 className="heading-display text-2xl text-primary">Quest Voyage</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground/70 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-foreground/70 hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-foreground/70 hover:text-primary transition-colors">Stories</a>
              <Button variant="outline" onClick={() => navigate("/discovery")}>
                Discover Places
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Epic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 achievement-glow">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Compass className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-20 right-10 achievement-glow">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Mountain className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 shimmer">
              🌟 Join 75,000+ Global Adventurers
            </Badge>
            
            <h1 className="heading-display text-6xl md:text-8xl mb-8 leading-none">
              Turn Travel Into
              <span className="block text-accent-handwriting text-secondary text-7xl md:text-9xl">
                Epic Quests
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover hidden gems, master local cultures, and earn legendary badges as you explore the world. 
              Your greatest adventure awaits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="btn-adventure text-lg px-10 py-6 group text-white shadow-2xl"
                onClick={() => navigate("/dashboard")}
              >
                <Plane className="mr-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                Start Your Quest
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => navigate("/missions")}
              >
                <Target className="mr-2 h-5 w-5" />
                Browse Missions
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up stats-card p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Paradise */}
      <section id="features" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🎯 Game-Changing Features
            </Badge>
            <h2 className="heading-display text-5xl md:text-6xl text-foreground mb-6">
              Your Passport to
              <span className="text-accent-handwriting text-primary block">Adventure</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform ordinary trips into extraordinary quests with AI-powered missions, 
              cultural immersion, and gamified exploration
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="travel-card p-8 text-center group relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <div className="relative mb-8">
                <img src={treasureBadges} alt="Gamified Missions" className="w-20 h-20 mx-auto rounded-xl" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="heading-display text-2xl mb-4">Epic Quests & Rewards</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Complete thrilling cultural missions, earn legendary XP, unlock mystical badges, 
                and climb global leaderboards as the ultimate explorer
              </p>
              <Badge className="badge-gold">🏆 500+ Unique Missions</Badge>
            </Card>

            <Card className="travel-card p-8 text-center group relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <div className="w-20 h-20 mx-auto mb-8 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Star className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="heading-display text-2xl mb-4">Cultural Immersion</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Master local customs, decode ancient traditions, learn indigenous languages, 
                and unlock the secrets of every destination
              </p>
              <Badge className="badge-silver">✨ 50+ Cultures</Badge>
            </Card>

            <Card className="travel-card p-8 text-center group relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <div className="w-20 h-20 mx-auto mb-8 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Globe className="h-10 w-10 text-accent" />
              </div>
              <h3 className="heading-display text-2xl mb-4">Hidden Realms</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                AI-powered discovery engine reveals secret gems, mystical locations, 
                and enchanted spots that guidebooks never mention
              </p>
              <Badge className="badge-bronze">🗺️ Infinite Discovery</Badge>
            </Card>
          </div>

          {/* Immersive Feature Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Real-Time Quest Intelligence</h4>
                  <p className="text-muted-foreground">Live crowd monitoring, perfect timing suggestions, and mystical location recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Adventurer's Guild</h4>
                  <p className="text-muted-foreground">Connect with fellow questers, form exploration parties, and conquer group challenges</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Digital Relics</h4>
                  <p className="text-muted-foreground">Collect mystical AR stamps, craft legendary travel chronicles, and preserve epic memories</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={travelCollage} 
                alt="Travel Destinations" 
                className="rounded-2xl shadow-luxury w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Traveler Stories */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              🌟 Epic Adventure Stories
            </Badge>
            <h2 className="heading-display text-5xl md:text-6xl text-foreground mb-6">
              Legends Born from
              <span className="text-accent-handwriting text-accent block">Real Quests</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="travel-card p-8 relative">
                <GlowingEffect
                  spread={30}
                  glow={true}
                  disabled={false}
                  proximity={48}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center justify-between">
                 <div>
                   <div className="font-semibold text-foreground">{testimonial.name}</div>
                   <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                 </div>
                  <Badge className="badge-gold text-xs">
                    {testimonial.achievement}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Epic CTA Section */}
      <section className="py-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 shimmer">
              🚀 Your Epic Journey Awaits
            </Badge>
            
            <h2 className="heading-display text-5xl md:text-7xl mb-8 leading-tight">
              Ready to Become a
              <span className="text-accent-handwriting text-secondary block">Legendary Explorer?</span>
            </h2>
            
            <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of adventurers already turning their travels into epic quests. 
              Your legendary story starts with a single step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-xl px-12 py-6 rounded-xl shadow-2xl group"
                onClick={() => navigate("/auth")}
              >
                <Trophy className="mr-3 h-6 w-6" />
                Begin Your Quest
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-xl px-12 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
              >
                <Globe className="mr-2 h-5 w-5" />
                Explore Demo
              </Button>
            </div>
            
            <div className="text-white/70 text-sm">
              ✨ Free to start • 🌍 Available worldwide • 🏆 Instant rewards
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={compassIcon} alt="Quest Voyage" className="w-8 h-8" />
                <h3 className="heading-display text-2xl">Quest Voyage</h3>
              </div>
              <p className="text-background/80 leading-relaxed">
                Transform your travels into legendary adventures with gamified cultural immersion and epic quests.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Epic Features</h4>
              <ul className="space-y-3 text-background/80">
                <li className="flex items-center"><Trophy className="h-4 w-4 mr-2" /> Gamified Missions</li>
                <li className="flex items-center"><Star className="h-4 w-4 mr-2" /> Cultural Immersion</li>
                <li className="flex items-center"><Globe className="h-4 w-4 mr-2" /> AI Discovery</li>
                <li className="flex items-center"><Zap className="h-4 w-4 mr-2" /> Real-time Insights</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Adventurer's Guild</h4>
              <ul className="space-y-3 text-background/80">
                <li className="flex items-center"><Users className="h-4 w-4 mr-2" /> Community Quests</li>
                <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Global Leaderboards</li>
                <li className="flex items-center"><Heart className="h-4 w-4 mr-2" /> Travel Stories</li>
                <li className="flex items-center"><Camera className="h-4 w-4 mr-2" /> Memory Palace</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quest Support</h4>
              <ul className="space-y-3 text-background/80">
                <li>Help Center</li>
                <li>Safety Guide</li>
                <li>Cultural Etiquette</li>
                <li>Privacy Quest</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-8 text-center text-background/60">
            <p>&copy; 2024 Quest Voyage. All rights reserved. Made with ❤️ for adventurers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;