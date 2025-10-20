import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LocationVerifierProps {
  missionId: string;
  targetLat: number;
  targetLng: number;
  onVerify: (data: { latitude: number; longitude: number }) => Promise<void>;
}

export const LocationVerifier = ({ missionId, targetLat, targetLng, onVerify }: LocationVerifierProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleCheckIn = async () => {
    setIsChecking(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation. Please use a modern browser.",
        variant: "destructive",
      });
      setIsChecking(false);
      return;
    }

    // Request location permission with enhanced error handling
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Current position:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          
          console.log('Target position:', {
            lat: targetLat,
            lng: targetLng,
          });
          
          await onVerify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch (error) {
          console.error('Verification error:', error);
          toast({
            title: "Verification failed",
            description: error instanceof Error ? error.message : "Could not verify location",
            variant: "destructive",
          });
        } finally {
          setIsChecking(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Please enable location access to verify this mission";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location access failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsChecking(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-base sm:text-lg mb-2">Location Check-In Required</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            You need to be at the mission location to complete this task
          </p>
        </div>

        <Button 
          onClick={handleCheckIn} 
          disabled={isChecking}
          className="w-full touch-manipulation h-11"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Check In Now
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};