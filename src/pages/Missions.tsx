import { useState } from 'react';
import { MissionsList } from '@/components/MissionsList';
import { MainNav } from '@/components/MainNav';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Compass, Target, Star } from 'lucide-react';

export default function Missions() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section - Osmo Style */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Subtle ambient gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container-wide mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <motion.h1 
              className="heading-display mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Quest Missions
            </motion.h1>

            <motion.p 
              className="text-xl sm:text-2xl text-muted-foreground max-w-2xl font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Complete cultural challenges and earn rewards while exploring destinations
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-wide mx-auto px-4 sm:px-6 pb-20">
        <MissionsList />
      </div>

      {/* Features Section */}
      <div className="bg-white/5 py-12 sm:py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">How It Works</h2>
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