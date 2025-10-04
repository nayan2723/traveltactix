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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
