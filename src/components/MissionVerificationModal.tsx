import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocationVerifier } from './LocationVerifier';
import { PhotoVerifier } from './PhotoVerifier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMissionId: string;
  missionTitle: string;
  verificationType: 'location' | 'photo' | 'checkin' | 'quiz';
  missionLocation?: { latitude: number; longitude: number };
  xpReward: number;
  onSuccess?: () => void;
}

export const MissionVerificationModal = ({
  isOpen,
  onClose,
  userMissionId,
  missionTitle,
  verificationType,
  missionLocation,
  xpReward,
  onSuccess,
}: MissionVerificationModalProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    notes: string;
    xp_awarded: number;
  } | null>(null);
  const { toast } = useToast();

  const handleVerify = async (verificationData: any) => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-mission', {
        body: {
          user_mission_id: userMissionId,
          verification_type: verificationType,
          verification_data: verificationData,
        },
      });

      if (error) throw error;

      setVerificationResult(data);

      if (data.verified) {
        toast({
          title: "Mission Complete! 🎉",
          description: `You earned ${data.xp_awarded} XP!`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Verification Failed",
          description: data.notes,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setVerificationResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{missionTitle}</DialogTitle>
        </DialogHeader>

        {verificationResult ? (
          <div className="py-8 text-center">
            {verificationResult.verified ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Success!</h3>
                <p className="text-muted-foreground mb-4">{verificationResult.notes}</p>
                <div className="text-3xl font-bold text-primary mb-6">
                  +{verificationResult.xp_awarded} XP
                </div>
                <Button onClick={handleClose} className="w-full">
                  Continue
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Not Verified</h3>
                <p className="text-muted-foreground mb-6">{verificationResult.notes}</p>
                <Button onClick={() => setVerificationResult(null)} className="w-full">
                  Try Again
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {verificationType === 'location' && missionLocation && (
              <LocationVerifier
                missionId={userMissionId}
                targetLat={missionLocation.latitude}
                targetLng={missionLocation.longitude}
                onVerify={handleVerify}
              />
            )}

            {verificationType === 'photo' && (
              <PhotoVerifier
                missionId={userMissionId}
                onVerify={handleVerify}
              />
            )}

            {isVerifying && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};