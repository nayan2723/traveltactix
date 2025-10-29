import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2, Map, Award, Target, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface TravelStats {
  placesVisited: number;
  missionsCompleted: number;
  totalXP: number;
  badges: number;
  cities: string[];
  timeline: Array<{
    date: string;
    title: string;
    location: string;
    xp: number;
  }>;
}

export const TravelExport = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchTravelStats();
    }
  }, [user]);

  const fetchTravelStats = async () => {
    if (!user) return;

    try {
      // Fetch places visited
      const { count: placesCount } = await supabase
        .from('user_place_visits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch completed missions with details
      const { data: missions } = await supabase
        .from('user_missions')
        .select(`
          *,
          missions (
            title,
            city,
            country,
            xp_reward
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      // Fetch badges
      const { count: badgesCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get unique cities
      const cities = [...new Set(missions?.map((m: any) => m.missions?.city).filter(Boolean) || [])];

      // Build timeline
      const timeline = missions?.slice(0, 10).map((m: any) => ({
        date: m.completed_at,
        title: m.missions?.title || 'Unknown Mission',
        location: `${m.missions?.city}, ${m.missions?.country}`,
        xp: m.missions?.xp_reward || 0,
      })) || [];

      setStats({
        placesVisited: placesCount || 0,
        missionsCompleted: missions?.length || 0,
        totalXP: profile?.total_xp || 0,
        badges: badgesCount || 0,
        cities: cities as string[],
        timeline,
      });
    } catch (error) {
      console.error('Error fetching travel stats:', error);
      toast.error('Failed to load travel stats');
    } finally {
      setLoading(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current || !stats) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TravelResume_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast.success('Travel resume exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export travel resume');
    } finally {
      setExporting(false);
    }
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `TravelResume_${format(new Date(), 'yyyy-MM-dd')}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Travel resume exported as image!');
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export travel resume');
    } finally {
      setExporting(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Sign in to export your travel resume</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading your travel data...</p>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Export Your Travel Resume</h3>
            <p className="text-sm text-muted-foreground">
              Download a beautiful summary of your journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportAsPDF} disabled={exporting}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF
            </Button>
            <Button variant="outline" onClick={exportAsImage} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              Image
            </Button>
          </div>
        </div>
      </Card>

      {/* Exportable Content */}
      <div ref={exportRef} className="bg-white p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {profile?.full_name || 'Travel Explorer'}
          </h1>
          <p className="text-xl text-gray-600">Travel Resume</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-900">{stats.missionsCompleted}</p>
            <p className="text-sm text-blue-700">Missions Completed</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-900">{stats.placesVisited}</p>
            <p className="text-sm text-green-700">Places Visited</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-900">{stats.badges}</p>
            <p className="text-sm text-purple-700">Badges Earned</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Map className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-900">{stats.cities.length}</p>
            <p className="text-sm text-orange-700">Cities Explored</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Level {profile?.level || 1} Explorer
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {stats.totalXP} XP
            </span>
          </div>
          <Progress 
            value={((stats.totalXP % 1000) / 1000) * 100} 
            className="h-3"
          />
        </div>

        {/* Cities Visited */}
        {stats.cities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cities Explored</h3>
            <div className="flex flex-wrap gap-2">
              {stats.cities.map((city, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {stats.timeline.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {stats.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0 w-16 text-xs text-gray-500">
                    {format(new Date(item.date), 'MMM dd')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{item.xp} XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Powered by TravelTacTix - Your Cultural Exploration Companion
          </p>
        </div>
      </div>
    </div>
  );
};