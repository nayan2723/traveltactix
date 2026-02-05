import { useState } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Globe, User, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SocialFeedProps {
  maxHeight?: string;
}

export const SocialFeed = ({ maxHeight = '600px' }: SocialFeedProps) => {
  const [feedType, setFeedType] = useState<'personal' | 'friends' | 'global'>('friends');
  const { activities, loading, hasMore, loadMore, getActivityIcon, refetch } = useActivityFeed(feedType);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Feed</CardTitle>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Tabs value={feedType} onValueChange={(v) => setFeedType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Me
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="global" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Global
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea style={{ maxHeight }} className="pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activities yet</p>
              {feedType === 'friends' && (
                <p className="text-xs mt-1">Add friends to see their activities!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 group">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.profile?.avatar_url} />
                    <AvatarFallback>
                      {activity.profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.profile?.full_name || 'Someone'}</span>
                          {' '}
                          <span className="text-muted-foreground">{activity.title}</span>
                        </p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="text-2xl flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-xs">
                        Lv. {activity.profile?.level || 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={loadMore}
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
