import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

const createMissingClient = () => ({
  auth: {
    async getSession() {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signInWithPassword() {
      throw new Error('Missing Supabase environment variables');
    },
    async signUp() {
      throw new Error('Missing Supabase environment variables');
    },
    async signOut() {
      throw new Error('Missing Supabase environment variables');
    },
    async resetPasswordForEmail() {
      throw new Error('Missing Supabase environment variables');
    },
  },
  from() {
    throw new Error('Missing Supabase environment variables');
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    };
  },
  removeChannel() {},
});

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMissingClient();
