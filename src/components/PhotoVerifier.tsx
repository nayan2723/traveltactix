import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PhotoVerifierProps {
  missionId: string;
  onVerify: (data: { imageData: string }) => void;
}

export const PhotoVerifier = ({ missionId, onVerify }: PhotoVerifierProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        toast({
          title: "Photo loaded",
          description: "Review your photo and tap Submit when ready",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Failed to load image",
          description: "Please try again with a different photo",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error loading photo",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;

    setIsUploading(true);
    try {
      await onVerify({ imageData: preview });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Could not verify photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h3 className="font-semibold text-base sm:text-lg mb-2">Photo Verification Required</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Take or upload a photo at the mission location
          </p>
        </div>

        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              No photo selected
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="touch-manipulation h-11"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>
        )}

        {preview && (
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading}
            className="w-full touch-manipulation h-11"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying Photo...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Submit Photo
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};