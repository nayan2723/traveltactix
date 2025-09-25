import { useState } from 'react';
import { MissionsList } from '@/components/MissionsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Compass, Target, Star } from 'lucide-react';

export default function Missions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-adventure-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Compass className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quest Missions
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Embark on location-based adventures tailored to your destination. 
              Discover hidden gems, complete challenges, and earn XP while exploring the world!
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-accent" />
                <span>50+ Missions Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Multiple Cities</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-travel-gold" />
                <span>Earn XP & Badges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <MissionsList />
      </div>

      {/* Features Section */}
      <div className="bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Choose Destination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select your travel destination or current location to discover relevant missions
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">Complete Missions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Follow mission objectives to explore local culture, food, and hidden gems
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-8 w-8 text-travel-gold mx-auto mb-2" />
                <CardTitle className="text-lg">Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gain XP points and unlock badges as you complete challenges and explore
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}