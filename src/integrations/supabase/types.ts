export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      error_reports: {
        Row: {
          browser_info: string | null
          contact_email: string | null
          created_at: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          page_url: string | null
          status: string | null
          steps_to_reproduce: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          browser_info?: string | null
          contact_email?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          page_url?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          browser_info?: string | null
          contact_email?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          page_url?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          about_text: string
          contact_email: string
          created_at: string
          id: string
          privacy_text: string
          social_links: Json
          terms_text: string
          updated_at: string
        }
        Insert: {
          about_text: string
          contact_email: string
          created_at?: string
          id?: string
          privacy_text: string
          social_links?: Json
          terms_text: string
          updated_at?: string
        }
        Update: {
          about_text?: string
          contact_email?: string
          created_at?: string
          id?: string
          privacy_text?: string
          social_links?: Json
          terms_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      key_points_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          id: string
          ifsc_code: string | null
          is_default: boolean | null
          payment_details: Json
          payment_type: string
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean | null
          payment_details: Json
          payment_type: string
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean | null
          payment_details?: Json
          payment_type?: string
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string
          payment_reference: string | null
          spark_points: number
          status: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method: string
          payment_reference?: string | null
          spark_points: number
          status?: string
          updated_at?: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          payment_reference?: string | null
          spark_points?: number
          status?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          custom_email: string | null
          display_name: string | null
          district: string | null
          full_name: string | null
          id: string
          key_points: number | null
          mpa_id: string | null
          place: string | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          state: string | null
          theme_preference: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          custom_email?: string | null
          display_name?: string | null
          district?: string | null
          full_name?: string | null
          id: string
          key_points?: number | null
          mpa_id?: string | null
          place?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          state?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          custom_email?: string | null
          display_name?: string | null
          district?: string | null
          full_name?: string | null
          id?: string
          key_points?: number | null
          mpa_id?: string | null
          place?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          state?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_earned: number | null
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      role_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          id: string
          reason: string | null
          requested_role: string
          requester_id: string
          status: string
          target_user_id: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_role: string
          requester_id: string
          status?: string
          target_user_id: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_role?: string
          requester_id?: string
          status?: string
          target_user_id?: string
        }
        Relationships: []
      }
      service_offers: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          point_cost: number
          start_date: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          point_cost: number
          start_date?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          point_cost?: number
          start_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_points: {
        Args: {
          user_id: string
          amount_to_deduct: number
        }
        Returns: number
      }
      get_error_report_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      process_referral_bonus: {
        Args: {
          referred_user_id: string
          referrer_code: string
        }
        Returns: boolean
      }
      user_daily_error_reports: {
        Args: {
          user_id: string
        }
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
