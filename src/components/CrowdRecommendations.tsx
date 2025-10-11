import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, MapPin, Users, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface Recommendation {
  place_id: string;
  name: string;
  city: string;
  crowd_percentage: number;
  crowd_status: string;
  reason: string;
  match_score: number;
  unique_highlight: string;
}

export const CrowdRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stage, setStage] = useState<'start' | 'questions' | 'results'>('start');

  const startQuestionnaire = async () => {
    setLoading(true);
    setStage('questions');
    
    try {
      const { data, error } = await supabase.functions.invoke('crowd-recommendations', {
        body: { action: 'generate_questions' }
      });

      if (error) throw error;

      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to start questionnaire');
      setStage('start');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      getRecommendations({ ...answers, [currentQuestion.id]: answer });
    }
  };

  const getRecommendations = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('crowd-recommendations', {
        body: { 
          action: 'get_recommendations',
          answers: finalAnswers 
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      setStage('results');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('start');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRecommendations([]);
  };

  const getCrowdColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold">Smart Crowd-Aware Recommendations</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Get personalized destination recommendations based on your preferences and real-time crowd data
        </p>

        <AnimatePresence mode="wait">
          {stage === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <Button
                onClick={startQuestionnaire}
                disabled={loading}
                size="lg"
                className="gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Preparing Questions...' : 'Start Questionnaire'}
                <Sparkles className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {stage === 'questions' && questions[currentQuestionIndex] && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
                <div className="flex gap-2">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        idx <= currentQuestionIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-6">
                {questions[currentQuestionIndex].question}
              </h3>

              <div className="grid gap-3">
                {questions[currentQuestionIndex].options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      disabled={loading}
                      variant="outline"
                      className="w-full justify-start h-auto p-4 text-left hover:bg-primary/10 hover:border-primary transition-all"
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Your Personalized Recommendations</h3>
                <Button onClick={reset} variant="outline" size="sm">
                  Start Over
                </Button>
              </div>

              <div className="grid gap-4">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.place_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Match: {rec.match_score}%
                            </Badge>
                            <Badge className={getCrowdColor(rec.crowd_status)}>
                              <Users className="w-3 h-3 mr-1" />
                              {rec.crowd_status} crowd
                            </Badge>
                          </div>
                          <h4 className="text-xl font-semibold mb-1">{rec.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rec.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingDown className={`w-4 h-4 ${getCrowdColor(rec.crowd_status)}`} />
                            <span className="text-2xl font-bold">{rec.crowd_percentage}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">crowd level</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Why this matches you:
                          </p>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        </div>

                        <div className="p-3 bg-secondary/10 rounded-lg">
                          <p className="text-sm font-medium mb-1">✨ Unique highlight:</p>
                          <p className="text-sm text-muted-foreground italic">{rec.unique_highlight}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};