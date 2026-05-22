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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      destinations: {
        Row: {
          best_time_to_visit: string | null
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration: string | null
          entry_fee: string | null
          estimated_budget: string | null
          featured: boolean
          gallery_images: string[] | null
          hero_image: string | null
          id: string
          last_updated: string
          latitude: number | null
          location: string | null
          longitude: number | null
          safety_notes: string | null
          slug: string
          title: string
          transport_info: string | null
          updated_at: string
        }
        Insert: {
          best_time_to_visit?: string | null
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          entry_fee?: string | null
          estimated_budget?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          hero_image?: string | null
          id?: string
          last_updated?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          safety_notes?: string | null
          slug: string
          title: string
          transport_info?: string | null
          updated_at?: string
        }
        Update: {
          best_time_to_visit?: string | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          entry_fee?: string | null
          estimated_budget?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          hero_image?: string | null
          id?: string
          last_updated?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          safety_notes?: string | null
          slug?: string
          title?: string
          transport_info?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          budget_range: string | null
          created_at: string
          description: string | null
          destinations_included: string[] | null
          duration: string | null
          hero_image: string | null
          id: string
          itinerary_content: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          description?: string | null
          destinations_included?: string[] | null
          duration?: string | null
          hero_image?: string | null
          id?: string
          itinerary_content?: Json
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          description?: string | null
          destinations_included?: string[] | null
          duration?: string | null
          hero_image?: string | null
          id?: string
          itinerary_content?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destination_id: string
          difficulty: string | null
          distance_km: number | null
          elevation_gain: number | null
          estimated_time: string | null
          gps_coordinates: Json | null
          id: string
          route_description: string | null
          route_name: string
        }
        Insert: {
          created_at?: string
          destination_id: string
          difficulty?: string | null
          distance_km?: number | null
          elevation_gain?: number | null
          estimated_time?: string | null
          gps_coordinates?: Json | null
          id?: string
          route_description?: string | null
          route_name: string
        }
        Update: {
          created_at?: string
          destination_id?: string
          difficulty?: string | null
          distance_km?: number | null
          elevation_gain?: number | null
          estimated_time?: string | null
          gps_coordinates?: Json | null
          id?: string
          route_description?: string | null
          route_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          created_at: string
          destination_id: string
          id: string
          update_content: string
          update_type: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          destination_id: string
          id?: string
          update_content: string
          update_type: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          destination_id?: string
          id?: string
          update_content?: string
          update_type?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "updates_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
