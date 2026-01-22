import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SuspenseFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export const SuspenseFallback = ({ 
  message = "Loading...", 
  fullScreen = true 
}: SuspenseFallbackProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary" />
      </motion.div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
};

// Map-specific loading state
export const MapFallback = () => (
  <div className="h-[400px] md:h-[500px] bg-muted/50 rounded-xl flex items-center justify-center">
    <div className="text-center space-y-3">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
      >
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </motion.div>
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  </div>
);

// AR Scanner loading state
export const ARFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4 px-6">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center"
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </motion.div>
      <p className="text-muted-foreground">Initializing AR Scanner...</p>
    </div>
  </div>
);
