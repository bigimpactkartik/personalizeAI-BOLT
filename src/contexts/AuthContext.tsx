import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle user registration - ensure profile exists
        if (event === 'SIGNED_UP' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking user profile:', fetchError);
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const fullName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: fullName
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Login failed - no user returned');
    }

    console.log('Login successful for:', data.user.email);
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('Attempting registration for:', email);
    
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Registration failed - no user returned');
    }

    console.log('Registration successful for:', data.user.email);
    console.log('User needs email confirmation:', !data.session);

    // If user is immediately available (auto-confirm enabled), create profile
    if (data.user && data.session) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: name.trim()
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw here as the user is already created in auth
        } else {
          console.log('User profile created successfully during registration');
        }
      } catch (profileError) {
        console.error('Error in profile creation:', profileError);
      }
    }

    return data;
  };

  const logout = async () => {
    console.log('Logging out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    console.log('Logout successful');
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};