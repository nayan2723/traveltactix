-- =============================================
-- Phase 5: Social Features & Enhanced Offline Support
-- =============================================

-- =============================================
-- 5.1 Offline Queue Table (for enhanced offline sync)
-- =============================================
CREATE TABLE IF NOT EXISTS public.offline_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  synced BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for syncing
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_synced ON public.offline_queue(user_id, synced);

-- Enable RLS
ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their offline queue"
ON public.offline_queue FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5.2 Friendships Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id, status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- =============================================
-- 5.3 Team Missions Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 5,
  invite_code TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  total_required INTEGER NOT NULL DEFAULT 1,
  deadline TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_missions_team ON public.team_missions(team_id);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Anyone can view public teams"
ON public.teams FOR SELECT
USING (is_public = true OR leader_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid()
));

CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update teams"
ON public.teams FOR UPDATE
USING (auth.uid() = leader_id);

CREATE POLICY "Leaders can delete teams"
ON public.teams FOR DELETE
USING (auth.uid() = leader_id);

-- RLS Policies for team_members
CREATE POLICY "Team members can view team members"
ON public.team_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
));

CREATE POLICY "Users can join teams"
ON public.team_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leaders can manage members"
ON public.team_members FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.teams WHERE id = team_members.team_id AND leader_id = auth.uid()
));

CREATE POLICY "Members can leave or leaders can remove"
ON public.team_members FOR DELETE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.teams WHERE id = team_members.team_id AND leader_id = auth.uid()
));

-- RLS Policies for team_missions
CREATE POLICY "Team members can view team missions"
ON public.team_missions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.team_members WHERE team_id = team_missions.team_id AND user_id = auth.uid()
));

CREATE POLICY "Team leaders can create missions"
ON public.team_missions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.teams WHERE id = team_missions.team_id AND leader_id = auth.uid()
));

CREATE POLICY "Team members can update mission progress"
ON public.team_missions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.team_members WHERE team_id = team_missions.team_id AND user_id = auth.uid()
));

-- =============================================
-- 5.4 Activity Feed Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'mission_completed', 'badge_earned', 'level_up', 'place_visited', 
    'friend_added', 'team_joined', 'achievement_unlocked', 'streak_milestone'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON public.activity_feed(is_public, created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity feed
CREATE POLICY "Users can view public activities or own activities"
ON public.activity_feed FOR SELECT
USING (
  is_public = true 
  OR user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE ((user_id = auth.uid() AND friend_id = activity_feed.user_id) 
    OR (friend_id = auth.uid() AND user_id = activity_feed.user_id))
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can create own activities"
ON public.activity_feed FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
ON public.activity_feed FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
ON public.activity_feed FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- 5.5 Private Messages Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to friends"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE ((user_id = auth.uid() AND friend_id = messages.receiver_id) 
    OR (friend_id = auth.uid() AND user_id = messages.receiver_id))
    AND status = 'accepted'
  )
);

CREATE POLICY "Receivers can mark messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Senders can delete their messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- =============================================
-- 5.6 AI Conversations Table (for AI assistant)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their AI conversations"
ON public.ai_conversations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Triggers
-- =============================================

-- Update timestamp triggers
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();