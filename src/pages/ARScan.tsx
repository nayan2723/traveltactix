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
  X,
  Navigation,
  Clock,
  Utensils,
  Sparkles,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "motion/react";

interface LandmarkResult {
  name: string;
  city: string;
  country: string;
  description: string;
  category: string;
  confidence: string;
  latitude?: number;
  longitude?: number;
  famousFoods?: Array<{ name: string; description: string }>;
  culturalFacts?: string[];
  nearbyAttractions?: Array<{ name: string; distance?: string; type?: string }>;
  bestTimeToVisit?: string;
}

interface PlaceData {
  id: string;
  name: string;
  description?: string;
  city: string;
  country: string;
  category: string;
  latitude?: number;
  longitude?: number;
  image_urls?: string[];
  crowd_status?: string;
  crowd_percentage?: number;
  cultural_tips?: any;
}

const ARScan = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [recognizedLandmark, setRecognizedLandmark] = useState<LandmarkResult | null>(null);
  const [matchedPlace, setMatchedPlace] = useState<PlaceData | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceData[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [cameraPermission, setCameraPermission] = useState<string>('prompt');

  const startCamera = async () => {
    try {
      // Prefer rear camera, but gracefully fall back to any available camera
      const tryGetStream = async (constraints: MediaStreamConstraints) =>
        await navigator.mediaDevices.getUserMedia(constraints);

      let stream: MediaStream | null = null;
      try {
        stream = await tryGetStream({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        // Fallback to front camera if environment is unavailable (e.g., desktops)
        stream = await tryGetStream({
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        const video = videoRef.current;
        // Ensure correct playback attributes across mobile browsers
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        video.srcObject = stream;
        // Switch UI immediately; playback will be attempted next
        setCameraPermission('granted');
        // On iOS Safari, ensure we explicitly call play() after metadata loads
        const playVideo = async () => {
          try {
            await video.play();
          } catch (err) {
            console.error('Video play() failed:', err);
            toast({
              title: 'Unable to start camera preview',
              description: 'Tap the screen once, then try again. Some browsers require an extra gesture.',
              variant: 'destructive',
            });
          }
        };

        if (video.readyState >= 2) {
          await playVideo();
        } else {
          video.onloadedmetadata = () => {
            playVideo();
          };
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      toast({
        title: 'Camera Access Failed',
        description: 'Please grant camera permission and ensure you are on HTTPS. If on desktop, try a different camera.',
        variant: 'destructive',
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
    setRecognizedLandmark(null);
    setMatchedPlace(null);
    setNearbyPlaces([]);
    setShowDetails(false);
  };

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await scanFromImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanFromImage = async (imageData: string) => {
    setIsScanning(true);
    setScanningProgress(0);

    try {
      // Animate progress
      const progressInterval = setInterval(() => {
        setScanningProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('recognize-landmark', {
        body: { imageData },
      });

      clearInterval(progressInterval);
      setScanningProgress(100);

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Recognition failed');
      }

      setRecognizedLandmark(data.landmark);
      setMatchedPlace(data.matchedPlace);
      setNearbyPlaces(data.nearbyPlaces || []);

      if (data.landmark.confidence === 'low') {
        toast({
          title: 'No Clear Landmark Detected',
          description: 'Try getting closer or pointing at a clearer view of the landmark',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Landmark Recognized!',
          description: `Found ${data.landmark.name}`,
        });
        setShowDetails(true);

        // Track the AR scan
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_cultural_progress').insert({
            user_id: user.id,
            content_id: null,
            lesson_id: null,
            progress_type: 'challenge_completed',
            cultural_xp_earned: 20,
            completion_data: {
              ar_scan: data.landmark.name,
              city: data.landmark.city,
              scanned_at: new Date().toISOString(),
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error scanning landmark:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to recognize landmark. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
      setScanningProgress(0);
    }
  };

  const scanLandmark = async () => {
    const imageData = captureImage();
    if (!imageData) {
      toast({
        title: 'Error',
        description: 'Failed to capture image',
        variant: 'destructive',
      });
      return;
    }
    await scanFromImage(imageData);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'monument': 
      case 'landmark': return <Star className="h-4 w-4" />;
      case 'temple':
      case 'religious': return <Book className="h-4 w-4" />;
      case 'museum': return <History className="h-4 w-4" />;
      case 'park':
      case 'nature': return <Navigation className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'monument':
      case 'landmark': return 'bg-warning/10 text-warning border-warning/20';
      case 'temple':
      case 'religious': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'museum': return 'bg-primary/10 text-primary border-primary/20';
      case 'park':
      case 'nature': return 'bg-success/10 text-success-foreground border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

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
          <div className="w-full h-full bg-gradient-to-br from-background via-card to-muted/50 flex items-center justify-center">
            <div className="text-center px-6">
              <Camera className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold mb-4">AR Landmark Scanner</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Point your camera at monuments and landmarks to discover details and nearby attractions
              </p>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button onClick={startCamera} className="btn-primary rounded-full px-8">
                  <Camera className="h-4 w-4 mr-2" />
                  Enable Camera
                </Button>
                <Button variant="outline" onClick={() => uploadInputRef.current?.click()} className="rounded-full px-8">
                  Upload Photo Instead
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Camera requires HTTPS. If blocked, open in a new tab and allow camera access.
              </p>
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
                className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ScanLine className="h-16 w-16 mx-auto mb-4 text-primary" />
                  </motion.div>
                  <div className="text-xl font-semibold mb-4">Analyzing landmark...</div>
                  <div className="w-64 h-2 bg-muted/30 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${scanningProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Using AI to identify the landmark</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Guide Overlay */}
          {!isScanning && !showDetails && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="border-4 border-primary rounded-2xl w-64 h-64"
              />
              <div className="absolute bottom-24 left-0 right-0 text-center">
                <p className="text-sm font-medium bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-border/50">
                  Center landmark in frame
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
              <h1 className="text-base font-semibold">AR Scanner</h1>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={stopCamera}
              className="bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <Button
              onClick={scanLandmark}
              disabled={isScanning}
              className="w-full btn-primary rounded-full h-14 text-base font-semibold shadow-xl"
            >
              {isScanning ? (
                <>
                  <ScanLine className="h-5 w-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="h-5 w-5 mr-2" />
                  Scan Landmark
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Landmark Details Overlay */}
      <AnimatePresence>
        {showDetails && recognizedLandmark && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-card/98 backdrop-blur-xl border-t border-border rounded-t-3xl max-h-[70vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(recognizedLandmark.category)}
                    <Badge className={`${getCategoryColor(recognizedLandmark.category)} border`}>
                      {recognizedLandmark.category}
                    </Badge>
                    {recognizedLandmark.confidence === 'high' && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        High Confidence
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{recognizedLandmark.name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {recognizedLandmark.city}, {recognizedLandmark.country}
                    </div>
                    <div className="flex items-center text-primary">
                      <Star className="h-3 w-3 mr-1" />
                      +20 XP earned
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetails(false);
                    setRecognizedLandmark(null);
                    setMatchedPlace(null);
                    setNearbyPlaces([]);
                  }}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <div className="bg-muted/30 p-4 rounded-xl mb-6">
                <p className="text-sm leading-relaxed text-foreground">
                  {recognizedLandmark.description}
                </p>
              </div>

              {/* Best Time to Visit */}
              {recognizedLandmark.bestTimeToVisit && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Best Time to Visit</h4>
                      <p className="text-sm text-foreground/80">{recognizedLandmark.bestTimeToVisit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cultural Facts */}
              {recognizedLandmark.culturalFacts && recognizedLandmark.culturalFacts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Cultural Facts
                  </h3>
                  <div className="space-y-2">
                    {recognizedLandmark.culturalFacts.map((fact, index) => (
                      <div key={index} className="bg-muted/20 p-3 rounded-lg">
                        <p className="text-sm leading-relaxed">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Famous Foods */}
              {recognizedLandmark.famousFoods && recognizedLandmark.famousFoods.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Utensils className="h-4 w-4 mr-2 text-primary" />
                    Famous Local Foods
                  </h3>
                  <div className="grid gap-3">
                    {recognizedLandmark.famousFoods.map((food, index) => (
                      <div key={index} className="travel-card p-4">
                        <h4 className="font-medium text-sm mb-1">{food.name}</h4>
                        <p className="text-xs text-muted-foreground">{food.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Nearby Attractions */}
              {recognizedLandmark.nearbyAttractions && recognizedLandmark.nearbyAttractions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Nearby Attractions
                  </h3>
                  <div className="grid gap-3">
                    {recognizedLandmark.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="travel-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{attraction.name}</h4>
                            {attraction.type && (
                              <Badge variant="outline" className="text-xs">
                                {attraction.type}
                              </Badge>
                            )}
                          </div>
                          {attraction.distance && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {attraction.distance}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Place Details */}
              {matchedPlace && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Place Information
                  </h3>
                  <div className="space-y-2">
                    {matchedPlace.crowd_status && (
                      <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                        <span className="text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Crowd Status
                        </span>
                        <Badge variant="outline" className={
                          matchedPlace.crowd_status === 'low' ? 'border-green-500/50 text-green-500' :
                          matchedPlace.crowd_status === 'medium' ? 'border-yellow-500/50 text-yellow-500' :
                          'border-red-500/50 text-red-500'
                        }>
                          {matchedPlace.crowd_status} ({matchedPlace.crowd_percentage}%)
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Database Nearby Places */}
              {nearbyPlaces.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Navigation className="h-4 w-4 mr-2 text-primary" />
                    More Places to Explore ({nearbyPlaces.length})
                  </h3>
                  <div className="grid gap-3">
                    {nearbyPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="travel-card p-4 cursor-pointer transition-transform hover:scale-[1.02]"
                      >
                        <div className="flex items-start gap-3">
                          {getCategoryIcon(place.category)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 truncate">{place.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {place.description || `${place.category} in ${place.city}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={getCategoryColor(place.category)}>
                                {place.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARScan;
