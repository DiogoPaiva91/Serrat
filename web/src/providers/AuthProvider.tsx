import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type UserRole = "admin" | "gestor" | "operador";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  company_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isGestor: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE: UserProfile = {
  id: "demo-user",
  full_name: "Diogo Paiva",
  email: "diogo@serrat.com",
  role: "admin",
  phone: "(13) 99999-0000",
  company_id: "a0000000-0000-0000-0000-000000000001",
  avatar_url: null,
  is_active: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - check localStorage
      const isDemoLoggedIn = localStorage.getItem("serrat-demo-auth");
      if (isDemoLoggedIn) {
        setProfile(DEMO_PROFILE);
        setDemoMode(true);
        setSession({ user: { id: "demo-user" } } as Session);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode login
      localStorage.setItem("serrat-demo-auth", "true");
      setProfile(DEMO_PROFILE);
      setDemoMode(true);
      setSession({ user: { id: "demo-user" } } as Session);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("serrat-demo-auth");
      setProfile(null);
      setDemoMode(false);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin: profile?.role === "admin",
        isGestor: profile?.role === "gestor",
        isDemoMode: demoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
