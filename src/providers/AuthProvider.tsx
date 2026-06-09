// Auth context backed by the mock auth module for now (Supabase free-tier
// limit — see BACKEND_NOTES.md). The context shape is what the Supabase
// implementation will expose, so screens won't change.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as mockAuth from "@/lib/mockAuth";
import type { MockUser } from "@/lib/mockAuth";

interface AuthState {
  user: MockUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<MockUser>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    mockAuth.getStoredUser().then((stored) => {
      setUser(stored);
      setInitializing(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await mockAuth.signIn(email, password));
  }, []);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    setUser(await mockAuth.signUp(displayName, email, password));
  }, []);

  const signOut = useCallback(async () => {
    await mockAuth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch: Partial<MockUser>) => {
    setUser(await mockAuth.updateUser(patch));
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, signOut, updateUser }),
    [user, initializing, signIn, signUp, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
