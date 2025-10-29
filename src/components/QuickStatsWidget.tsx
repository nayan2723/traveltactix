import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Flame, 
  ChevronDown, 
  ChevronUp,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const QuickStatsWidget = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!user || !profile || !isVisible) return null;

  const level = profile.level || 1;
  const currentXP = profile.total_xp || 0;
  const xpForNextLevel = level * 1000;
  const xpProgress = ((currentXP % 1000) / 1000) * 100;
  const xpToNextLevel = 1000 - (currentXP % 1000);

  // Mock data - in production, fetch from context or API
  const activeMissionsCount = 3;
  const currentStreak = 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Card className="bg-background/95 backdrop-blur-xl border-border shadow-2xl w-80">
        {/* Compact View */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Quick Stats</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* XP Progress */}
            <div 
              className="cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Level {level}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {xpToNextLevel} XP to go
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            {/* Active Missions */}
            <div
              className="cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
              onClick={() => navigate('/missions')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Active Missions</span>
                </div>
                <Badge variant="secondary">{activeMissionsCount}</Badge>
              </div>
            </div>

            {/* Streak */}
            <div
              className="cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Daily Streak</span>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  {currentStreak} days
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{currentXP}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/5 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{level}</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsExpanded(false);
                  }}
                >
                  View Full Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};