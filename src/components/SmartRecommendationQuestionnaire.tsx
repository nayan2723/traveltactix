import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, ChevronRight, MapPin, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  type: string;
  options: string[];
}

interface Recommendation {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  image_urls: string[];
  mood_tags: string[];
  recommendation_reason: string;
  match_score: number;
  unique_highlight: string;
  ai_powered: boolean;
}

export function SmartRecommendationQuestionnaire() {
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'questions' | 'loading' | 'results'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const startQuestionnaire = async () => {
    if (!user) {
      toast.error("Please sign in to get personalized recommendations");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendations', {
        body: { userId: user.id, mode: 'questions' }
      });

      if (error) throw error;

      setQuestions(data.questions);
      setStep('questions');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      generateRecommendations({ ...answers, [currentQuestion.id]: answer });
    }
  };

  const generateRecommendations = async (finalAnswers: Record<string, string>) => {
    setStep('loading');
    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendations', {
        body: {
          userId: user?.id,
          mode: 'recommendations',
          answers: finalAnswers
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      setStep('results');
      toast.success("🎯 AI-powered recommendations ready!");
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error("Failed to generate recommendations. Please try again.");
      setStep('intro');
    }
  };

  const reset = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRecommendations([]);
  };

  if (step === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="travel-card border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="heading-display text-3xl">
              AI-Powered Smart Recommendations
            </CardTitle>
            <CardDescription className="text-base">
              Our advanced algorithm combines <strong>Gemini AI</strong> and <strong>Perplexity</strong> to analyze
              your preferences and real-time travel trends, delivering the most personalized destination recommendations ever.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <Sparkles className="w-6 h-6 mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Gemini AI</h4>
                <p className="text-sm text-muted-foreground">
                  Deep learning analysis of your travel style
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <TrendingUp className="w-6 h-6 mb-2 text-purple-600" />
                <h4 className="font-semibold mb-1">Perplexity</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time travel trends and insights
                </p>
              </div>
            </div>
            <Button
              onClick={startQuestionnaire}
              disabled={isGenerating || !user}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isGenerating ? (
                "Generating Questions..."
              ) : !user ? (
                "Sign In to Continue"
              ) : (
                <>
                  Start Smart Quiz
                  <ChevronRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'questions') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="travel-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Analyzing...</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 px-6 text-left justify-start hover:border-primary hover:bg-primary/5"
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="text-base">{option}</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6 animate-pulse">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Analyzing Your Preferences...</h3>
        <p className="text-muted-foreground mb-8">
          Our AI is combining Gemini insights with real-time Perplexity trends
        </p>
        <div className="space-y-2 max-w-md mx-auto">
          {[
            "Understanding your travel style...",
            "Fetching real-time travel trends...",
            "Matching hidden gems to your preferences...",
            "Calculating perfect recommendations..."
          ].map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5 }}
              className="text-sm text-muted-foreground"
            >
              ✓ {text}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (step === 'results') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="heading-display text-3xl mb-2">Your Perfect Destinations</h2>
          <p className="text-muted-foreground">
            Powered by Gemini AI + Perplexity • Personalized just for you
          </p>
          <Button onClick={reset} variant="outline" className="mt-4">
            Take Quiz Again
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="travel-card overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={rec.image_urls?.[0] || '/placeholder.svg'}
                    alt={rec.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold border-0">
                    {rec.match_score}% Match
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{rec.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                      <MapPin className="w-3 h-3" />
                      {rec.city}, {rec.country}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rec.mood_tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-primary">Why this fits you:</strong>
                          <p className="text-foreground/90 mt-1">{rec.recommendation_reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-purple-600">Unique Highlight:</strong>
                          <p className="text-foreground/90 mt-1">{rec.unique_highlight}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="default">
                    Explore This Gem
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return null;
}
