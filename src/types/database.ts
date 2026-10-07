export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          mobile_number: string;
          email_address: string;
          date_of_birth: string;
          address: string;
          authorized: boolean;
          mobile_verified: boolean;
          mpin_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          mobile_number: string;
          email_address: string;
          date_of_birth: string;
          address: string;
          authorized: boolean;
          mobile_verified?: boolean;
          mpin_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      customers: {
        Row: {
          user_id: string;
          customer_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          customer_id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
        Relationships: [];
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          aadhaar_number: string;
          pan_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          aadhaar_number: string;
          pan_number: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kyc_documents']['Insert']>;
        Relationships: [];
      };
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          account_holder_name: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          branch_name: string | null;
          account_type: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_holder_name: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          branch_name?: string | null;
          account_type?: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bank_accounts']['Insert']>;
        Relationships: [];
      };
      nominees: {
        Row: {
          id: string;
          user_id: string;
          nominee_name: string;
          relationship: string;
          nominee_aadhaar: string;
          nominee_mobile: string | null;
          nominee_pan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nominee_name: string;
          relationship: string;
          nominee_aadhaar: string;
          nominee_mobile?: string | null;
          nominee_pan?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['nominees']['Insert']>;
        Relationships: [];
      };
      agreement_renewal_requests: {
        Row: {
          id: string;
          investment_id: string;
          user_id: string;
          agreement_id: string;
          customer_id: string;
          current_amount: number;
          increment_amount: number | null;
          mode: 'same_amount' | 'increase';
          status: 'Pending' | 'Approved' | 'Rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          investment_id: string;
          user_id: string;
          agreement_id: string;
          customer_id: string;
          current_amount: number;
          increment_amount?: number | null;
          mode: 'same_amount' | 'increase';
          status?: 'Pending' | 'Approved' | 'Rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['agreement_renewal_requests']['Insert']
        >;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string;
          reference_id: string | null;
          decision: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          title: string;
          body: string;
          reference_id?: string | null;
          decision: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          request_id: string | null;
          name: string;
          detail_subtitle: string | null;
          status: string;
          fund_amount: number;
          current_value: number | null;
          invested_date: string | null;
          interest_rate: number;
          tds_percent: number;
          completed_interest_periods: number;
          total_earnings: number;
          tds_deducted_amount: number;
          yield_rate: string | null;
          earned_interest: string | null;
          tds_deducted: string | null;
          net_earned: string | null;
          bank_account_id: string;
          nominee_id: string;
          pay_date: string;
          payout_day: number | null;
          payout_day_overridden: boolean;
          referral_code: string | null;
          referrer_user_id: string | null;
          agreement_charges: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code?: string;
          request_id?: string | null;
          name?: string;
          detail_subtitle?: string | null;
          status?: string;
          fund_amount: number;
          current_value?: number | null;
          invested_date?: string | null;
          interest_rate?: number;
          tds_percent?: number;
          completed_interest_periods?: number;
          total_earnings?: number;
          tds_deducted_amount?: number;
          yield_rate?: string | null;
          earned_interest?: string | null;
          tds_deducted?: string | null;
          net_earned?: string | null;
          bank_account_id: string;
          nominee_id: string;
          pay_date: string;
          payout_day?: number | null;
          payout_day_overridden?: boolean;
          referral_code?: string | null;
          referrer_user_id?: string | null;
          agreement_charges?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['investments']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'investments_bank_account_id_fkey';
            columns: ['bank_account_id'];
            isOneToOne: false;
            referencedRelation: 'bank_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'investments_nominee_id_fkey';
            columns: ['nominee_id'];
            isOneToOne: false;
            referencedRelation: 'nominees';
            referencedColumns: ['id'];
          },
        ];
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          investment_id: string;
          bank_account_id: string;
          status: string;
          withdrawal_amount: number;
          strategy: string;
          code: string;
          request_id: string | null;
          requested_on: string;
          net_payout: number | null;
          status_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          investment_id: string;
          bank_account_id: string;
          status?: string;
          withdrawal_amount: number;
          strategy?: string;
          code?: string;
          request_id?: string | null;
          requested_on?: string;
          net_payout?: number | null;
          status_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['withdrawals']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'withdrawals_investment_id_fkey';
            columns: ['investment_id'];
            isOneToOne: false;
            referencedRelation: 'investments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'withdrawals_bank_account_id_fkey';
            columns: ['bank_account_id'];
            isOneToOne: false;
            referencedRelation: 'bank_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_code: string;
          transaction_type: string;
          amount: number;
          investment_id: string | null;
          investment_plan_id: string;
          reference_id: string | null;
          transaction_date: string;
          source_type: string;
          source_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_code?: string;
          transaction_type: string;
          amount: number;
          investment_id?: string | null;
          investment_plan_id: string;
          reference_id?: string | null;
          transaction_date: string;
          source_type: string;
          source_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'transactions_investment_id_fkey';
            columns: ['investment_id'];
            isOneToOne: false;
            referencedRelation: 'investments';
            referencedColumns: ['id'];
          },
        ];
      };
      referral_codes: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          referral_code: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_codes']['Insert']>;
        Relationships: [];
      };
      referral_rewards: {
        Row: {
          id: string;
          referrer_user_id: string;
          referred_user_id: string;
          investment_id: string;
          referral_code: string;
          capital_amount: number;
          referral_rate: number;
          gross_bonus: number;
          tds_rate: number;
          tds_amount: number;
          net_bonus: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_user_id: string;
          referred_user_id: string;
          investment_id: string;
          referral_code: string;
          capital_amount: number;
          referral_rate: number;
          gross_bonus: number;
          tds_rate: number;
          tds_amount: number;
          net_bonus: number;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_rewards']['Insert']>;
        Relationships: [];
      };
      referral_settings: {
        Row: {
          id: number;
          referral_rate: number;
          tds_rate: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          referral_rate?: number;
          tds_rate?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_user_investment_interest: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_recovery_mobile_by_email: {
        Args: { p_email: string };
        Returns: string;
      };
      get_login_email_by_mobile: {
        Args: { p_mobile: string };
        Returns: string;
      };
      is_email_mobile_combo_available: {
        Args: { p_email: string; p_mobile: string };
        Returns: boolean;
      };
      mark_mobile_verified: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      complete_password_recovery: {
        Args: { p_email: string; p_new_password: string };
        Returns: undefined;
      };
      complete_mpin_recovery: {
        Args: { p_email: string; p_new_mpin: string };
        Returns: undefined;
      };
      set_own_mpin: {
        Args: { p_mpin: string };
        Returns: undefined;
      };
      verify_own_mpin: {
        Args: { p_mpin: string };
        Returns: boolean;
      };
      get_investor_portal_settings: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_my_referral_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      validate_referral_code: {
        Args: { p_code: string };
        Returns: boolean;
      };
      lookup_referral_code: {
        Args: { p_code: string };
        Returns: Json;
      };
      get_my_referral_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_my_referral_history: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          referred_name: string;
          investment_code: string | null;
          capital_amount: number;
          net_bonus: number;
          referral_code: string;
          created_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
