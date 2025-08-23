import { supabase as supabaseClient } from "@/integrations/supabase/client"

export const supabase = supabaseClient

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          description: string
          date: string
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          description: string
          date: string
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          description?: string
          date?: string
          month?: string
          created_at?: string
        }
      }
    }
  }
}