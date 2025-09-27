import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Clock, MapPin, Star, Target, Calendar } from 'lucide-react';

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
  is_active: boolean;
}

interface MissionCardProps {
  mission: Mission;
  onStart: (missionId: string) => void;
  formatDeadline: (deadline: string) => string;
}

export function MissionCard({ mission, onStart, formatDeadline }: MissionCardProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStart(mission.id);
    } finally {
      setIsStarting(false);
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return '🍽️';
      case 'cultural':
        return '🏛️';
      case 'adventure':
        return '🗻';
      case 'social':
        return '👥';
      case 'historical':
        return '🏺';
      default:
        return '📍';
    }
  };

  const deadlineText = formatDeadline(mission.deadline);
  const isExpired = deadlineText === 'Expired';

  return (
    <Card className="mission-card relative overflow-hidden hover:shadow-glow transition-all duration-300 group">
      <GlowingEffect
        spread={30}
        glow={true}
        disabled={false}
        proximity={48}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div className="absolute inset-0 bg-card-gradient opacity-50"></div>
      <div className="relative z-10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(mission.category)}</span>
              <CardTitle className="text-base leading-tight">{mission.title}</CardTitle>
            </div>
            <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {mission.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{mission.city}, {mission.country}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className={isExpired ? 'text-destructive' : ''}>
                {deadlineText}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-travel-gold" />
              <span className="font-semibold text-sm">{mission.xp_reward} XP</span>
            </div>
            
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isStarting || isExpired}
              className="gap-2 text-xs px-3 py-1"
            >
              <Target className="h-3 w-3" />
              {isStarting ? 'Starting...' : isExpired ? 'Expired' : 'Start Mission'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}