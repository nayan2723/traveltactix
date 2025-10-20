import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, CheckCircle2, Star, MapPin } from 'lucide-react';

interface UserMissionWithDetails {
  id: string;
  user_id: string;
  mission_id: string;
  progress: number;
  total_required: number;
  is_completed: boolean;
  verification_status: string | null;
  verification_type: string | null;
  missions: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    xp_reward: number;
    city: string;
    country: string;
    deadline: string;
  } | null;
}

export function MyTasksTabs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserMissionWithDetails[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('user_missions')
          .select('*, missions(*)')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });
        setItems((data as any) || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (!user) {
    return (
      <Card className="text-center">
        <CardContent className="py-10">
          <p className="text-muted-foreground">Sign in to see your tasks.</p>
        </CardContent>
      </Card>
    );
  }

  const ongoing = items.filter(i => !i.is_completed && i.verification_status !== 'saved');
  const saved = items.filter(i => i.verification_status === 'saved' && !i.is_completed);
  const completed = items.filter(i => i.is_completed);

  const Section = ({ title, list }: { title: string; list: UserMissionWithDetails[] }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No items</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((um) => (
            <Card key={um.id} className="p-4 space-y-3">
              <CardHeader className="p-0">
                <CardTitle className="text-base">{um.missions?.title || 'Mission'}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{um.missions?.city}, {um.missions?.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{um.missions?.difficulty}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-travel-gold" />
                    <span>{um.missions?.xp_reward} XP</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => navigate(`/missions/${um.mission_id}`)}
                >
                  {um.is_completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> View
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" /> Open
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="ongoing" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      <TabsContent value="ongoing"><Section title="Ongoing" list={ongoing} /></TabsContent>
      <TabsContent value="saved"><Section title="Saved" list={saved} /></TabsContent>
      <TabsContent value="completed"><Section title="Completed" list={completed} /></TabsContent>
    </Tabs>
  );
}
