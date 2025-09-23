import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Star, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-adventure.jpg";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Quest Voyage
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Transform your travels into epic adventures. Discover hidden gems, complete cultural missions, 
              and unlock achievements as you explore the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="btn-adventure text-lg px-8 py-4 group"
                onClick={() => navigate("/auth")}
              >
                Start Your Adventure
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-secondary">50K+</div>
                <div className="text-white/80">Active Explorers</div>
              </div>
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-secondary">200+</div>
                <div className="text-white/80">Destinations</div>
              </div>
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-secondary">500+</div>
                <div className="text-white/80">Cultural Missions</div>
              </div>
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-secondary">100+</div>
                <div className="text-white/80">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Adventure Awaits
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the world like never before with our gamified travel platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Gamified Missions</h3>
              <p className="text-muted-foreground">
                Complete exciting travel challenges, earn XP, unlock badges, and climb the leaderboards
              </p>
            </Card>

            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Star className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Cultural Immersion</h3>
              <p className="text-muted-foreground">
                Learn local customs, try traditional foods, and discover hidden cultural gems
              </p>
            </Card>

            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Offbeat Discovery</h3>
              <p className="text-muted-foreground">
                AI-powered recommendations for unique, lesser-known destinations tailored to your mood
              </p>
            </Card>

            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <Zap className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-Time Insights</h3>
              <p className="text-muted-foreground">
                Live crowd monitoring and smart suggestions for the perfect travel timing
              </p>
            </Card>

            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-warning/10 rounded-full flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                <Users className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Social Adventures</h3>
              <p className="text-muted-foreground">
                Connect with fellow travelers, share experiences, and complete group missions
              </p>
            </Card>

            <Card className="adventure-card p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Digital Souvenirs</h3>
              <p className="text-muted-foreground">
                Collect AR stamps, create travel diaries, and preserve your adventure memories
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Quest?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of adventurers already exploring the world in a whole new way
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
                onClick={() => navigate("/auth")}
              >
                Create Free Account
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Quest Voyage</h3>
              <p className="text-background/80">
                Transform your travels into epic adventures with gamified cultural immersion.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-background/80">
                <li>Gamified Missions</li>
                <li>Cultural Tips</li>
                <li>AI Trip Planner</li>
                <li>Real-time Insights</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-background/80">
                <li>Social Features</li>
                <li>Leaderboards</li>
                <li>Group Missions</li>
                <li>Travel Stories</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-background/80">
                <li>Help Center</li>
                <li>Safety Guide</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 Quest Voyage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;