export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          theme: 'light' | 'dark';
          subscription_status: 'free' | 'pro';
          created_at: string;
          updated_at: string;
          last_tutorial_shown_month: string | null;
        };
        Insert: {
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          theme?: 'light' | 'dark';
          subscription_status?: 'free' | 'pro';
          last_tutorial_shown_month?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          theme?: 'light' | 'dark';
          subscription_status?: 'free' | 'pro';
          last_tutorial_shown_month?: string | null;
        };
      };
      income_sources: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          is_custom: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          is_custom?: boolean;
        };
        Update: {
          name?: string;
          is_custom?: boolean;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          source_id: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_id: string;
          amount: number;
          date: string;
        };
        Update: {
          source_id?: string;
          amount?: number;
          date?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          is_custom: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          is_custom?: boolean;
        };
        Update: {
          name?: string;
          is_custom?: boolean;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          date: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          date?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          date: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          date?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
        };
        Update: {
          subject?: string;
          message?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          locked_amount: number;
          lock_expiry: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          locked_amount?: number;
          lock_expiry?: string | null;
        };
        Update: {
          balance?: number;
          locked_amount?: number;
          lock_expiry?: string | null;
        };
      };
      wallet_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: 'add' | 'withdraw' | 'lock' | 'unlock';
          amount: number;
          description: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: 'add' | 'withdraw' | 'lock' | 'unlock';
          amount: number;
          description: string;
          timestamp?: string;
        };
        Update: {
          transaction_type?: 'add' | 'withdraw' | 'lock' | 'unlock';
          amount?: number;
          description?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type IncomeSource = Database['public']['Tables']['income_sources']['Row'];
export type Income = Database['public']['Tables']['incomes']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'];