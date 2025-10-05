import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { 
  Globe, 
  BookOpen, 
  Star, 
  Volume2,
  Languages,
  Filter,
  MapPin,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "motion/react";

interface CulturalContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  difficulty_level: string;
  city: string;
  country: string;
  language: string;
  cultural_xp: number;
  metadata: any;
  audio_url?: string;
  image_url?: string;
}

const CulturalFeed = () => {
  const { toast } = useToast();
  const [culturalContent, setCulturalContent] = useState<CulturalContent[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCulturalContent();
  }, [selectedCity, selectedType]);

  const fetchCulturalContent = async () => {
    try {
      let query = supabase
        .from('cultural_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCity !== "all") {
        query = query.eq('city', selectedCity);
      }

      if (selectedType !== "all") {
        query = query.eq('content_type', selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCulturalContent(data || []);
    } catch (error) {
      console.error('Error fetching cultural content:', error);
      toast({
        title: "Error",
        description: "Failed to load cultural content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (contentId: string, culturalXp: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to track your progress",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_cultural_progress')
        .insert({
          user_id: user.id,
          content_id: contentId,
          progress_type: 'content_viewed',
          cultural_xp_earned: culturalXp,
          completion_data: { viewed_at: new Date().toISOString() }
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast({
        title: "Progress Saved!",
        description: `You earned ${culturalXp} cultural XP!`,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'greeting': return <Languages className="h-5 w-5" />;
      case 'tip': return <BookOpen className="h-5 w-5" />;
      case 'trivia': return <Sparkles className="h-5 w-5" />;
      case 'ar_fact': return <Globe className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'greeting': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'tip': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'trivia': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ar_fact': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const cities = [...new Set(culturalContent.map(content => content.city))];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
          <div className="heading-display text-2xl mb-2">Loading Cultural Insights...</div>
          <div className="text-white/80">Discovering amazing cultural content</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Cultural{" "}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Feed
              </span>
            </motion.h1>

            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Daily insights, greetings, and customs from cultures around the world
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="all">All Types</option>
            <option value="greeting">Greetings</option>
            <option value="tip">Cultural Tips</option>
            <option value="trivia">Trivia</option>
            <option value="ar_fact">AR Facts</option>
          </select>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {culturalContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full p-6 relative overflow-hidden hover:shadow-lg transition-shadow">
                <GlowingEffect
                  spread={25}
                  glow={true}
                  disabled={false}
                  proximity={40}
                  inactiveZone={0.01}
                  borderWidth={1}
                />
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getContentIcon(content.content_type)}
                    <h3 className="font-semibold text-lg">{content.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-orange-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{content.cultural_xp} XP</span>
                  </div>
                </div>

                {/* Location & Language */}
                <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{content.city}, {content.country}</span>
                  </div>
                  {content.language && (
                    <Badge variant="outline" className="text-xs">
                      {content.language}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {content.content}
                </p>

                {/* Pronunciation Help */}
                {content.metadata?.pronunciation && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Pronunciation:</div>
                    <div className="text-primary font-mono">{content.metadata.pronunciation}</div>
                  </div>
                )}

                {/* Audio Button */}
                {content.audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-4"
                    onClick={() => {
                      const audio = new Audio(content.audio_url);
                      audio.play().catch(() => {
                        toast({
                          title: "Audio Unavailable",
                          description: "Audio file could not be played",
                          variant: "destructive"
                        });
                      });
                    }}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Listen
                  </Button>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(content.content_type)}>
                      {content.content_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getDifficultyColor(content.difficulty_level)}>
                      {content.difficulty_level}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => markAsViewed(content.id, content.cultural_xp)}
                    className="btn-adventure"
                  >
                    Mark as Read
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {culturalContent.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Cultural Content Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new content!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CulturalFeed;