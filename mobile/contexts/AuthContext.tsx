import { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMyProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
  session: Session | null;
  initializing: boolean;
  /** Current user's saved display name, or null if unset / signed out. */
  displayName: string | null;
  /** Re-read the profile (call after the user edits their name). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  initializing: true,
  displayName: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const profile = await getMyProfile();
    setDisplayName(profile?.displayName ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      refreshProfile();
    } else {
      setDisplayName(null);
    }
  }, [session?.user?.id, refreshProfile]);

  return (
    <AuthContext.Provider value={{ session, initializing, displayName, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
