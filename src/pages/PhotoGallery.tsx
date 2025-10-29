import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MainNav } from '@/components/MainNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, MapPin, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ShareButton } from '@/components/ShareButton';

interface MissionPhoto {
  id: string;
  mission_title: string;
  mission_category: string;
  photo_url: string;
  location: string;
  completed_at: string;
  xp_earned: number;
}

export default function PhotoGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<MissionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<MissionPhoto | null>(null);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    if (!user) return;

    try {
      const { data: userMissions, error } = await supabase
        .from('user_missions')
        .select(`
          id,
          completed_at,
          verification_data,
          missions (
            title,
            category,
            city,
            country,
            xp_reward
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .not('verification_data->photo_url', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const photoData: MissionPhoto[] = userMissions?.map((mission: any) => ({
        id: mission.id,
        mission_title: mission.missions?.title || 'Unknown Mission',
        mission_category: mission.missions?.category || 'general',
        photo_url: mission.verification_data?.photo_url || '',
        location: `${mission.missions?.city}, ${mission.missions?.country}`,
        completed_at: mission.completed_at,
        xp_earned: mission.missions?.xp_reward || 0,
      })) || [];

      setPhotos(photoData);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view your photos</h2>
            <p className="text-muted-foreground">
              Complete missions and capture memories!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mission Photo Gallery</h1>
          <p className="text-muted-foreground">
            Your cultural exploration journey in photos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{photos.length}</p>
                <p className="text-sm text-muted-foreground">Total Photos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(photos.map(p => p.location)).size}
                </p>
                <p className="text-sm text-muted-foreground">Locations Visited</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Award className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {photos.reduce((sum, p) => sum + p.xp_earned, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="aspect-square animate-pulse bg-muted" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <Card className="p-12 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground">
              Complete missions with photo verification to build your gallery!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.mission_title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-semibold text-white mb-1 line-clamp-2">
                          {photo.mission_title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {photo.mission_category}
                    </Badge>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{photo.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(photo.completed_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-500 font-semibold">
                        <Award className="h-3 w-3" />
                        <span>+{photo.xp_earned} XP</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.mission_title}
                className="w-full rounded-lg"
              />
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold">{selectedPhoto.mission_title}</h2>
                  <ShareButton
                    title={selectedPhoto.mission_title}
                    text={`I completed this mission in ${selectedPhoto.location}!`}
                    url={window.location.href}
                  />
                </div>
                <Badge variant="secondary" className="mb-4">
                  {selectedPhoto.mission_category}
                </Badge>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedPhoto.completed_at), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">+{selectedPhoto.xp_earned} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}