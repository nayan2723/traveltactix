import { MainNav } from '@/components/MainNav';
import { TravelExport } from '@/components/TravelExport';
import { ShareButton, generateShareableUrl } from '@/components/ShareButton';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export default function TravelResume() {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const shareUrl = generateShareableUrl('resume', user?.id);
  const shareTitle = `${profile?.full_name || 'Traveler'}'s Travel Resume`;
  const shareText = `Check out my travel achievements on TravelTacTix! Level ${profile?.level || 1} explorer with ${profile?.total_xp || 0} XP.`;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Travel Resume</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Journey Summary
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Export and share your travel achievements, missions, and experiences
          </p>
          
          {/* Share Button */}
          <ShareButton 
            title={shareTitle}
            text={shareText}
            url={shareUrl}
            variant="default"
            size="default"
          />
        </motion.div>

        {/* Export Component */}
        <TravelExport />
      </main>
    </div>
  );
}