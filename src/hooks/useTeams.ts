import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  max_members: number;
  invite_code: string | null;
  is_public: boolean;
  created_at: string;
  member_count?: number;
  members?: TeamMember[];
  missions?: TeamMission[];
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
    level: number;
  };
}

interface TeamMission {
  id: string;
  team_id: string;
  mission_id: string;
  status: 'active' | 'completed' | 'failed';
  progress: number;
  total_required: number;
  deadline: string | null;
  completed_at: string | null;
  mission?: {
    title: string;
    description: string;
    xp_reward: number;
  };
}

export const useTeams = () => {
  const { user } = useAuth();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTeams = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch teams I'm a member of
      const { data: memberOf } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamIds = memberOf?.map(m => m.team_id) || [];
      
      if (teamIds.length === 0) {
        setMyTeams([]);
        setLoading(false);
        return;
      }

      // Fetch team details
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (error) throw error;

      // Fetch members for each team
      const { data: allMembers } = await supabase
        .from('team_members')
        .select('*')
        .in('team_id', teamIds);

      // Fetch profiles for all members
      const memberUserIds = [...new Set((allMembers || []).map(m => m.user_id))];
      let profileMap = new Map();
      
      if (memberUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level')
          .in('user_id', memberUserIds);
        
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      // Fetch team missions
      const { data: allMissions } = await supabase
        .from('team_missions')
        .select('*')
        .in('team_id', teamIds);

      // Get mission details
      const missionIds = [...new Set((allMissions || []).map(m => m.mission_id))];
      let missionMap = new Map();
      
      if (missionIds.length > 0) {
        const { data: missions } = await supabase
          .from('missions')
          .select('id, title, description, xp_reward')
          .in('id', missionIds);
        
        missionMap = new Map(missions?.map(m => [m.id, m]) || []);
      }

      // Combine all data
      const teamsWithDetails: Team[] = (teams || []).map(team => {
        const teamMembers = (allMembers || [])
          .filter(m => m.team_id === team.id)
          .map(m => ({
            ...m,
            role: m.role as TeamMember['role'],
            profile: profileMap.get(m.user_id)
          }));

        const teamMissions = (allMissions || [])
          .filter(m => m.team_id === team.id)
          .map(m => ({
            ...m,
            status: m.status as TeamMission['status'],
            mission: missionMap.get(m.mission_id)
          }));

        return {
          ...team,
          members: teamMembers,
          missions: teamMissions,
          member_count: teamMembers.length
        };
      });

      setMyTeams(teamsWithDetails);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPublicTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_public', true)
        .limit(20);

      if (error) throw error;

      // Get member counts
      const teamIds = (data || []).map(t => t.id);
      if (teamIds.length > 0) {
        const { data: memberCounts } = await supabase
          .from('team_members')
          .select('team_id')
          .in('team_id', teamIds);

        const countMap = new Map<string, number>();
        (memberCounts || []).forEach(m => {
          countMap.set(m.team_id, (countMap.get(m.team_id) || 0) + 1);
        });

        setPublicTeams((data || []).map(t => ({
          ...t,
          member_count: countMap.get(t.id) || 0
        })));
      } else {
        setPublicTeams([]);
      }
    } catch (error) {
      console.error('Error fetching public teams:', error);
    }
  }, []);

  useEffect(() => {
    fetchMyTeams();
    fetchPublicTeams();
  }, [fetchMyTeams, fetchPublicTeams]);

  const createTeam = async (name: string, description?: string, isPublic = false) => {
    if (!user) return null;

    try {
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          leader_id: user.id,
          invite_code: inviteCode,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as leader
      await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'leader'
        });

      toast.success('Team created!');
      fetchMyTeams();
      return team;
    } catch (error) {
      toast.error('Failed to create team');
      return null;
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Joined team!');
      fetchMyTeams();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Already a team member');
      } else {
        toast.error('Failed to join team');
      }
      return false;
    }
  };

  const joinByInviteCode = async (code: string) => {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (error || !team) {
        toast.error('Invalid invite code');
        return false;
      }

      return joinTeam(team.id);
    } catch (error) {
      toast.error('Failed to join team');
      return false;
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left team');
      fetchMyTeams();
      return true;
    } catch (error) {
      toast.error('Failed to leave team');
      return false;
    }
  };

  const assignMission = async (teamId: string, missionId: string, totalRequired = 1, deadline?: Date) => {
    try {
      const { error } = await supabase
        .from('team_missions')
        .insert({
          team_id: teamId,
          mission_id: missionId,
          total_required: totalRequired,
          deadline: deadline?.toISOString()
        });

      if (error) throw error;

      toast.success('Mission assigned to team!');
      fetchMyTeams();
      return true;
    } catch (error) {
      toast.error('Failed to assign mission');
      return false;
    }
  };

  const updateTeamMissionProgress = async (teamMissionId: string, progressIncrement: number) => {
    try {
      // Get current progress
      const { data: current } = await supabase
        .from('team_missions')
        .select('progress, total_required')
        .eq('id', teamMissionId)
        .single();

      if (!current) return false;

      const newProgress = current.progress + progressIncrement;
      const isCompleted = newProgress >= current.total_required;

      const { error } = await supabase
        .from('team_missions')
        .update({
          progress: newProgress,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', teamMissionId);

      if (error) throw error;

      if (isCompleted) {
        toast.success('Team mission completed! 🎉');
      }

      fetchMyTeams();
      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  };

  return {
    myTeams,
    publicTeams,
    loading,
    createTeam,
    joinTeam,
    joinByInviteCode,
    leaveTeam,
    assignMission,
    updateTeamMissionProgress,
    refetch: fetchMyTeams
  };
};
