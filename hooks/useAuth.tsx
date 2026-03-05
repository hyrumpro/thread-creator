'use client';

import { createContext, useContext, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const authKeys = {
  session: () => ['auth', 'session'] as const,
}

async function fetchAuthUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchAuthUser,
    staleTime: Infinity,  // Only invalidated by onAuthStateChange
    gcTime: Infinity,
    retry: false,
  })
}

interface AuthContextType {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const signOut = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  const { data: user, isLoading } = useSession()
  return { user, isLoading, ...context }
}
