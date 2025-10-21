import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Play, 
  CheckCircle,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  Volume2,
  Lightbulb,
  Languages,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "motion/react";

interface CulturalLesson {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  language: string;
  lesson_data: any;
  duration_minutes: number;
  cultural_xp: number;
  difficulty_level: string;
}

interface LessonProgress {
  lesson_id: string;
  progress_type: string;
  completion_data: any;
  cultural_xp_earned: number;
}

const CulturalLessons = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<CulturalLesson[]>([]);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<CulturalLesson | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiHint, setAiHint] = useState<string>("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  useEffect(() => {
    fetchLessonsAndProgress();
  }, []);

  const fetchLessonsAndProgress = async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('cultural_lessons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      const { data: { user } } = await supabase.auth.getUser();
      let progressData = [];
      
      if (user) {
        const { data: progress, error: progressError } = await supabase
          .from('user_cultural_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('progress_type', 'lesson_completed');

        if (progressError) throw progressError;
        progressData = progress || [];
      }

      setLessons(lessonsData || []);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load cultural lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (lesson: CulturalLesson) => {
    setSelectedLesson(lesson);
    setCurrentQuestion(0);
    setAnswers([]);
    setLessonComplete(false);
  };

  const submitAnswer = (answer: any) => {
    if (!selectedLesson?.lesson_data?.questions) return;
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion + 1 >= selectedLesson.lesson_data.questions.length) {
      completeLesson(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const completeLesson = async (finalAnswers: any[]) => {
    if (!selectedLesson?.lesson_data?.questions) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your progress",
          variant: "destructive",
        });
        return;
      }

      const questions = selectedLesson.lesson_data.questions;
      const correctAnswers = finalAnswers.filter((answer, index) => {
        const question = questions[index];
        if (question.type === 'multiple_choice') {
          return answer === question.correct;
        }
        return true; // For now, mark pronunciation and scenario as correct
      });

      const score = (correctAnswers.length / questions.length) * 100;
      const xpEarned = score >= 70 ? selectedLesson.cultural_xp : Math.floor(selectedLesson.cultural_xp * 0.5);

      const { error } = await supabase
        .from('user_cultural_progress')
        .insert({
          user_id: user.id,
          lesson_id: selectedLesson.id,
          progress_type: 'lesson_completed',
          cultural_xp_earned: xpEarned,
          completion_data: {
            score,
            answers: finalAnswers,
            completed_at: new Date().toISOString()
          }
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setLessonComplete(true);
      toast({
        title: "Lesson Complete!",
        description: `You earned ${xpEarned} cultural XP! Score: ${score.toFixed(0)}%`,
      });

      // Refresh progress
      fetchLessonsAndProgress();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId);
  };

  const getAiHint = async () => {
    if (!selectedLesson?.lesson_data?.questions) return;
    
    setLoadingHint(true);
    try {
      const question = selectedLesson.lesson_data.questions[currentQuestion];
      
      const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
        body: {
          type: 'hint',
          question: question.question || question.text,
          context: {
            lesson: selectedLesson.title,
            language: selectedLesson.language,
            difficulty: selectedLesson.difficulty_level
          }
        }
      });

      if (error) throw error;
      setAiHint(data.hint);
    } catch (error) {
      console.error('Error getting AI hint:', error);
      toast({
        title: "Hint Unavailable",
        description: "Could not generate hint at this time",
        variant: "destructive"
      });
    } finally {
      setLoadingHint(false);
    }
  };

  const translateText = async () => {
    if (!translationText.trim() || !selectedLesson) return;
    
    setLoadingTranslation(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
        body: {
          type: 'translate',
          text: translationText,
          targetLanguage: selectedLesson.language
        }
      });

      if (error) throw error;
      setTranslatedText(data.translation);
    } catch (error) {
      console.error('Error translating:', error);
      toast({
        title: "Translation Failed",
        description: "Could not translate text at this time",
        variant: "destructive"
      });
    } finally {
      setLoadingTranslation(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-accent/10 text-accent-foreground';
      case 'intermediate': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
          <div className="heading-display text-2xl mb-2">Loading Cultural Lessons...</div>
          <div className="text-muted-foreground">Preparing your learning experience</div>
        </div>
      </div>
    );
  }

  // Lesson Detail View
  if (selectedLesson && !lessonComplete) {
    // Safety check - ensure lesson_data and questions exist
    const questions = selectedLesson.lesson_data?.questions;
    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-background text-foreground">
          <MainNav />
          <div className="container mx-auto px-4 py-8">
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-xl font-semibold mb-2">Lesson Content Unavailable</div>
              <div className="text-muted-foreground mb-4">
                This lesson's content is being prepared. Please try another lesson.
              </div>
              <Button onClick={() => setSelectedLesson(null)} className="btn-adventure">
                Back to Lessons
              </Button>
            </Card>
          </div>
        </div>
      );
    }
    
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="heading-display text-2xl">{selectedLesson.title}</h1>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedLesson(null);
                    setAiHint("");
                    setTranslationText("");
                    setTranslatedText("");
                  }}
                >
                  Exit Lesson
                </Button>
              </div>
              
              <div className="mb-2">
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {selectedLesson.lesson_data.questions.length}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Question Card */}
              <div className="md:col-span-2">
                <Card className="p-8 relative">
                  <GlowingEffect
                    spread={30}
                    glow={true}
                    disabled={false}
                    proximity={50}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />

                  {question.type === 'multiple_choice' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
                      <div className="space-y-3">
                        {question.options.map((option: string, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full text-left justify-start p-4 h-auto"
                            onClick={() => {
                              submitAnswer(index);
                              setAiHint("");
                            }}
                          >
                            <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

              {question.type === 'pronunciation' && (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">Practice Pronunciation</h2>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">{question.text}</div>
                    <div className="text-lg text-muted-foreground mb-2">{question.romanji}</div>
                    <div className="text-sm text-muted-foreground">{question.meaning}</div>
                  </div>
                  
                  {question.audio && (
                    <Button
                      variant="outline"
                      className="mb-6"
                      onClick={() => {
                        const audio = new Audio(question.audio);
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
                  
                  <div>
                    <Button
                      onClick={() => submitAnswer('practiced')}
                      className="btn-adventure"
                    >
                      I've Practiced This
                    </Button>
                  </div>
                </div>
              )}

                  {question.type === 'scenario' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Cultural Scenario</h2>
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground">{question.situation}</p>
                      </div>
                      <div className="mb-6">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Appropriate Response:</div>
                        <div className="text-lg font-semibold">{question.response}</div>
                      </div>
                      <Button
                        onClick={() => {
                          submitAnswer(question.response);
                          setAiHint("");
                        }}
                        className="btn-adventure"
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </Card>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="space-y-4">
                {/* AI Hint Card */}
                <Card className="p-4 relative">
                  <GlowingEffect
                    spread={20}
                    glow={true}
                    disabled={false}
                    proximity={40}
                    inactiveZone={0.01}
                    borderWidth={1}
                  />
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold">AI Learning Assistant</h3>
                  </div>
                  
                  {aiHint ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm leading-relaxed">{aiHint}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAiHint("")}
                        className="w-full"
                      >
                        Clear Hint
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={getAiHint}
                      disabled={loadingHint}
                      className="w-full"
                      variant="outline"
                    >
                      {loadingHint ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Get AI Hint
                        </>
                      )}
                    </Button>
                  )}
                </Card>

                {/* Translation Card */}
                <Card className="p-4 relative">
                  <GlowingEffect
                    spread={20}
                    glow={true}
                    disabled={false}
                    proximity={40}
                    inactiveZone={0.01}
                    borderWidth={1}
                  />
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Languages className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold">Translator</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter English text to translate..."
                      value={translationText}
                      onChange={(e) => setTranslationText(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    
                    <Button
                      onClick={translateText}
                      disabled={loadingTranslation || !translationText.trim()}
                      className="w-full"
                      size="sm"
                    >
                      {loadingTranslation ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages className="h-4 w-4 mr-2" />
                          Translate to {selectedLesson.language}
                        </>
                      )}
                    </Button>
                    
                    {translatedText && (
                      <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                        <div className="text-xs text-muted-foreground mb-1">Translation:</div>
                        <p className="text-sm leading-relaxed">{translatedText}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lesson Complete View
  if (lessonComplete && selectedLesson) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Trophy className="h-24 w-24 mx-auto mb-6 text-yellow-500" />
            </motion.div>
            
            <h1 className="heading-display text-3xl mb-4">Lesson Complete!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You've successfully completed "{selectedLesson.title}"
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setSelectedLesson(null)}
                className="btn-adventure"
              >
                Back to Lessons
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lessons List View
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 12,
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
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Lessons
              </span>
            </motion.h1>

            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Master local customs, traditions, and language through interactive lessons
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-6 relative overflow-hidden">
                  <GlowingEffect
                    spread={25}
                    glow={true}
                    disabled={false}
                    proximity={40}
                    inactiveZone={0.01}
                    borderWidth={1}
                  />

                  {completed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {lesson.city}, {lesson.country}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {lesson.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span>{lesson.cultural_xp} XP</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                        {lesson.difficulty_level}
                      </Badge>
                      {lesson.language && (
                        <Badge variant="outline">
                          {lesson.language}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => startLesson(lesson)}
                    className="w-full btn-adventure"
                    disabled={completed}
                  >
                    {completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Lesson
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Cultural Lessons Available</h3>
            <p className="text-muted-foreground">
              Check back later for new interactive cultural lessons!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CulturalLessons;