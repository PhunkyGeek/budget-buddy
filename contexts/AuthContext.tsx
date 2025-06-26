import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createProfile } from '@/services/supabaseService';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Check if the error is "no rows found" (PGRST116)
        if (error.code === 'PGRST116' || error.message.includes('no rows')) {
          console.log('No profile found, creating new profile...');
          
          // Extract user information
          const firstName = user.user_metadata?.first_name || 
                           user.user_metadata?.given_name || 
                           user.user_metadata?.name?.split(' ')[0] || 
                           'User';
          const lastName = user.user_metadata?.last_name || 
                          user.user_metadata?.family_name || 
                          user.user_metadata?.name?.split(' ').slice(1).join(' ') || 
                          '';
          const email = user.email || '';

          // Create the profile
          const newProfile = await createProfile(user.id, firstName, lastName, email);
          setProfile(newProfile);
          console.log('Profile created successfully:', newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}