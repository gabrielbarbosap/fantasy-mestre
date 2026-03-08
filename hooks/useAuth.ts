"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export function useAuth() {
  const [user, loading, error] = useAuthState(getFirebaseAuth());
  return { user, loading, error, isAuthenticated: !!user };
}
