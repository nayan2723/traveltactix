export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ar_hotspots: {
        Row: {
          city: string
          country: string
          created_at: string
          cultural_facts: Json
          id: string
          image_url: string | null
          is_active: boolean
          landmark_name: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          cultural_facts?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          landmark_name: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          cultural_facts?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          landmark_name?: string
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: string
          created_at: string
          criteria: Json | null
          description: string
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          criteria?: Json | null
          description: string
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          criteria?: Json | null
          description?: string
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cultural_content: {
        Row: {
          audio_url: string | null
          city: string
          content: string
          content_type: string
          country: string
          created_at: string
          cultural_xp: number
          difficulty_level: string
          id: string
          image_url: string | null
          is_active: boolean
          language: string | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          city: string
          content: string
          content_type: string
          country: string
          created_at?: string
          cultural_xp?: number
          difficulty_level?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          language?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          city?: string
          content?: string
          content_type?: string
          country?: string
          created_at?: string
          cultural_xp?: number
          difficulty_level?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          language?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cultural_lessons: {
        Row: {
          city: string
          country: string
          created_at: string
          cultural_xp: number
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_active: boolean
          language: string | null
          lesson_data: Json
          title: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          cultural_xp?: number
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          language?: string | null
          lesson_data: Json
          title: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          cultural_xp?: number
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          language?: string | null
          lesson_data?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string
          city: string | null
          country: string | null
          created_at: string
          deadline: string | null
          description: string
          difficulty: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category: string
          city?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          difficulty: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      offline_queue: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          id: string
          synced: boolean
          synced_at: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          created_at?: string
          id?: string
          synced?: boolean
          synced_at?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          id?: string
          synced?: boolean
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          best_visit_times: Json | null
          category: string
          city: string
          country: string
          created_at: string
          crowd_percentage: number | null
          crowd_status: string | null
          cultural_tips: Json | null
          description: string | null
          estimated_visit_time: number | null
          id: string
          image_urls: string[] | null
          is_hidden_gem: boolean | null
          last_crowd_update: string | null
          latitude: number | null
          longitude: number | null
          mood_tags: string[] | null
          name: string
          updated_at: string
        }
        Insert: {
          best_visit_times?: Json | null
          category: string
          city: string
          country: string
          created_at?: string
          crowd_percentage?: number | null
          crowd_status?: string | null
          cultural_tips?: Json | null
          description?: string | null
          estimated_visit_time?: number | null
          id?: string
          image_urls?: string[] | null
          is_hidden_gem?: boolean | null
          last_crowd_update?: string | null
          latitude?: number | null
          longitude?: number | null
          mood_tags?: string[] | null
          name: string
          updated_at?: string
        }
        Update: {
          best_visit_times?: Json | null
          category?: string
          city?: string
          country?: string
          created_at?: string
          crowd_percentage?: number | null
          crowd_status?: string | null
          cultural_tips?: Json | null
          description?: string | null
          estimated_visit_time?: number | null
          id?: string
          image_urls?: string[] | null
          is_hidden_gem?: boolean | null
          last_crowd_update?: string | null
          latitude?: number | null
          longitude?: number | null
          mood_tags?: string[] | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          level: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          updated_at: string
          xp_cost: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          updated_at?: string
          xp_cost: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          updated_at?: string
          xp_cost?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline: string | null
          id: string
          mission_id: string
          progress: number
          status: string
          team_id: string
          total_required: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          mission_id: string
          progress?: number
          status?: string
          team_id: string
          total_required?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          mission_id?: string
          progress?: number
          status?: string
          team_id?: string
          total_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_missions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invite_code: string | null
          is_public: boolean
          leader_id: string
          max_members: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean
          leader_id: string
          max_members?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean
          leader_id?: string
          max_members?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cultural_progress: {
        Row: {
          completed_at: string
          completion_data: Json | null
          content_id: string | null
          cultural_xp_earned: number
          id: string
          lesson_id: string | null
          progress_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completion_data?: Json | null
          content_id?: string | null
          cultural_xp_earned?: number
          id?: string
          lesson_id?: string | null
          progress_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completion_data?: Json | null
          content_id?: string | null
          cultural_xp_earned?: number
          id?: string
          lesson_id?: string | null
          progress_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cultural_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cultural_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cultural_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "cultural_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          mission_id: string
          progress: number | null
          started_at: string
          total_required: number
          user_id: string
          verification_data: Json | null
          verification_notes: string | null
          verification_status: string | null
          verification_type: string | null
          verified_at: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_id: string
          progress?: number | null
          started_at?: string
          total_required: number
          user_id: string
          verification_data?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_type?: string | null
          verified_at?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_id?: string
          progress?: number | null
          started_at?: string
          total_required?: number
          user_id?: string
          verification_data?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_type?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_place_visits: {
        Row: {
          id: string
          notes: string | null
          photos: Json | null
          place_id: string
          rating: number | null
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          notes?: string | null
          photos?: Json | null
          place_id: string
          rating?: number | null
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          notes?: string | null
          photos?: Json | null
          place_id?: string
          rating?: number | null
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_place_visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      user_redemptions: {
        Row: {
          id: string
          redeemed_at: string
          shop_item_id: string
          user_id: string
          xp_spent: number
        }
        Insert: {
          id?: string
          redeemed_at?: string
          shop_item_id: string
          user_id: string
          xp_spent: number
        }
        Update: {
          id?: string
          redeemed_at?: string
          shop_item_id?: string
          user_id?: string
          xp_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_redemptions_shop_item_id_fkey"
            columns: ["shop_item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search_history: {
        Row: {
          id: string
          location_lat: number | null
          location_lng: number | null
          place_id: string | null
          search_query: string | null
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          place_id?: string | null
          search_query?: string | null
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          place_id?: string | null
          search_query?: string | null
          searched_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_search_history_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_login_date: string | null
          longest_streak: number
          total_logins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login_date?: string | null
          longest_streak?: number
          total_logins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login_date?: string | null
          longest_streak?: number
          total_logins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          level: number | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_level_from_xp: { Args: { xp: number }; Returns: number }
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          max_allowed: number
          reset_at: string
        }[]
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_leaderboard_entry: {
        Args: { target_user_id: string }
        Returns: {
          display_name: string
          level: number
          rank: number
          total_xp: number
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
