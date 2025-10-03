import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { 
  Camera,
  ScanLine,
  MapPin,
  Info,
  Star,
  History,
  Book,
  Settings,
  Zap,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "motion/react";

interface ARHotspot {
  id: string;
  landmark_name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  cultural_facts: CulturalFact[];
  image_url?: string;
}

interface CulturalFact {
  fact: string;
  category: string;
}

const ARScan = () => {
  const { toast } = useToast();
  const [hotspots, setHotspots] = useState<ARHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<ARHotspot | null>(null);
  const [selectedFact, setSelectedFact] = useState<CulturalFact | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraPermission, setCameraPermission] = useState<string>('prompt');

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('ar_hotspots')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setHotspots((data || []).map(hotspot => ({
        ...hotspot,
        cultural_facts: Array.isArray(hotspot.cultural_facts) 
          ? (hotspot.cultural_facts as unknown as CulturalFact[])
          : []
      })));
    } catch (error) {
      console.error('Error fetching AR hotspots:', error);
      toast({
        title: "Error",
        description: "Failed to load AR hotspots",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission('granted');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use AR scanning",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraPermission('prompt');
  };

  const simulateScan = () => {
    if (hotspots.length === 0) {
      toast({
        title: "No Landmarks Found",
        description: "Try pointing your camera at a famous landmark",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanningProgress(0);

    const progressInterval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Simulate finding a random hotspot
          const randomHotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
          setSelectedHotspot(randomHotspot);
          setIsScanning(false);
          
          toast({
            title: "Landmark Detected!",
            description: `Found ${randomHotspot.landmark_name}`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const viewCulturalFact = async (fact: CulturalFact) => {
    setSelectedFact(fact);
    
    // Mark as viewed for XP
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && selectedHotspot) {
        const { error } = await supabase
          .from('user_cultural_progress')
          .insert({
            user_id: user.id,
            content_id: null,
            lesson_id: null,
            progress_type: 'challenge_completed',
            cultural_xp_earned: 15,
            completion_data: {
              ar_fact: fact.fact,
              landmark: selectedHotspot.landmark_name,
              viewed_at: new Date().toISOString()
            }
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error saving AR progress:', error);
        } else {
          toast({
            title: "Cultural Discovery!",
            description: "You earned 15 cultural XP!",
          });
        }
      }
    } catch (error) {
      console.error('Error tracking AR interaction:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'history': return <History className="h-4 w-4" />;
      case 'architecture': return <Settings className="h-4 w-4" />;
      case 'science': return <Zap className="h-4 w-4" />;
      case 'tradition': return <Book className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'history': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'architecture': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'science': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'tradition': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera View */}
      <div className="absolute inset-0">
        {cameraPermission === 'granted' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-24 w-24 mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-bold mb-4">AR Cultural Scanner</h2>
              <p className="text-gray-300 mb-6 max-w-md">
                Point your camera at landmarks to discover amazing cultural facts and stories
              </p>
              <Button
                onClick={startCamera}
                className="btn-adventure"
              >
                <Camera className="h-4 w-4 mr-2" />
                Enable Camera
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AR Overlay */}
      {cameraPermission === 'granted' && (
        <>
          {/* Scanning Animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/20 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ScanLine className="h-16 w-16 mx-auto mb-4" />
                  </motion.div>
                  <div className="text-xl font-semibold mb-2">Scanning for landmarks...</div>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      style={{ width: `${scanningProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AR Hotspots Overlay */}
          {!isScanning && !selectedHotspot && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Simulated AR hotspots */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-1/3 left-1/4 pointer-events-auto"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-primary/80 text-white hover:bg-primary pointer-events-auto"
                  onClick={() => {
                    if (hotspots.length > 0) {
                      setSelectedHotspot(hotspots[0]);
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Tokyo Tower
                </Button>
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-1/2 right-1/3 pointer-events-auto"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-secondary/80 text-white hover:bg-secondary pointer-events-auto"
                  onClick={() => {
                    if (hotspots.length > 1) {
                      setSelectedHotspot(hotspots[1]);
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Senso-ji
                </Button>
              </motion.div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="text-white">
              <h1 className="text-lg font-semibold">AR Cultural Scanner</h1>
              <p className="text-sm text-white/70">
                {isScanning ? 'Scanning...' : 'Tap landmarks to discover culture'}
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={stopCamera}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <Button
              onClick={simulateScan}
              disabled={isScanning}
              className="w-full btn-adventure"
            >
              {isScanning ? (
                <>
                  <ScanLine className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4 mr-2" />
                  Scan for Landmarks
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Cultural Facts Overlay */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t"
          >
            <Card className="m-0 border-0 rounded-none p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedHotspot.landmark_name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedHotspot.city}, {selectedHotspot.country}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedHotspot(null);
                    setSelectedFact(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!selectedFact ? (
                <div>
                  <h3 className="font-medium mb-3">Cultural Facts</h3>
                  <div className="grid gap-3">
                    {selectedHotspot.cultural_facts.map((fact: CulturalFact, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start p-4 h-auto"
                        onClick={() => viewCulturalFact(fact)}
                      >
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(fact.category)}
                          <div>
                            <div className="font-medium">{fact.fact}</div>
                            <Badge className={`mt-1 ${getCategoryColor(fact.category)}`}>
                              {fact.category}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFact(null)}
                    >
                      ← Back
                    </Button>
                    <Badge className={getCategoryColor(selectedFact.category)}>
                      {selectedFact.category}
                    </Badge>
                    <div className="flex items-center text-xs text-orange-500">
                      <Star className="h-3 w-3 mr-1" />
                      +15 XP
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg relative">
                    <GlowingEffect
                      spread={20}
                      glow={true}
                      disabled={false}
                      proximity={30}
                      inactiveZone={0.01}
                      borderWidth={1}
                    />
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedFact.fact}
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARScan;