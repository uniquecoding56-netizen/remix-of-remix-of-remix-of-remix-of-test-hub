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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_master_chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      daily_ai_tests: {
        Row: {
          created_at: string
          generated_date: string
          id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          generated_date?: string
          id?: string
          test_id: string
        }
        Update: {
          created_at?: string
          generated_date?: string
          id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_ai_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_progress: {
        Row: {
          content_hash: string
          created_at: string
          ease_factor: number
          flashcard_id: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          ease_factor?: number
          flashcard_id: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          ease_factor?: number
          flashcard_id?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rating: number
          test_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          test_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_flashcards: {
        Row: {
          created_at: string
          flashcards: Json
          id: string
          source_type: string | null
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcards?: Json
          id?: string
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flashcards?: Json
          id?: string
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_notes: {
        Row: {
          created_at: string
          id: string
          notes: Json
          source_type: string | null
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: Json
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: Json
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_qa_conversations: {
        Row: {
          content: string | null
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_tests: {
        Row: {
          created_at: string
          id: string
          test_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          test_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_website_content: {
        Row: {
          content: string | null
          created_at: string
          generated_content: string | null
          id: string
          updated_at: string
          user_id: string
          website_title: string | null
          website_url: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          generated_content?: string | null
          id?: string
          updated_at?: string
          user_id: string
          website_title?: string | null
          website_url: string
        }
        Update: {
          content?: string | null
          created_at?: string
          generated_content?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          website_title?: string | null
          website_url?: string
        }
        Relationships: []
      }
      saved_youtube_videos: {
        Row: {
          created_at: string
          generated_notes: string | null
          id: string
          transcript: string | null
          updated_at: string
          user_id: string
          video_id: string
          video_thumbnail: string | null
          video_title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          generated_notes?: string | null
          id?: string
          transcript?: string | null
          updated_at?: string
          user_id: string
          video_id: string
          video_thumbnail?: string | null
          video_title: string
          video_url: string
        }
        Update: {
          created_at?: string
          generated_notes?: string | null
          id?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string
          video_thumbnail?: string | null
          video_title?: string
          video_url?: string
        }
        Relationships: []
      }
      shared_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          expires_at: string | null
          id: string
          share_token: string
          thumbnail_url: string | null
          title: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          content_data: Json
          content_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token: string
          thumbnail_url?: string | null
          title?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token?: string
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          score: number
          test_id: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          score?: number
          test_id: string
          total_questions?: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          score?: number
          test_id?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          category: Database["public"]["Enums"]["test_category"]
          class_standard: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_ai_generated: boolean | null
          questions: Json
          subject: string | null
          timer_seconds: number | null
          title: string
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["test_category"]
          class_standard?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_ai_generated?: boolean | null
          questions?: Json
          subject?: string | null
          timer_seconds?: number | null
          title: string
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["test_category"]
          class_standard?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_ai_generated?: boolean | null
          questions?: Json
          subject?: string | null
          timer_seconds?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string | null
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
      user_notifications: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          sound_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      test_category:
        | "math"
        | "science"
        | "history"
        | "english"
        | "geography"
        | "languages"
        | "computer_science"
        | "arts"
        | "music"
        | "sports"
        | "other"
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
    Enums: {
      test_category: [
        "math",
        "science",
        "history",
        "english",
        "geography",
        "languages",
        "computer_science",
        "arts",
        "music",
        "sports",
        "other",
      ],
    },
  },
} as const
