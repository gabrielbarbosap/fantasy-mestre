"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserProfile } from "@/services/user.service";
import type { User } from "@/types/user";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetchUserProfile(user.uid)
      .then((p) => setProfile(p ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    refetch();
  }, [refetch, user?.uid]);

  return { profile, loading, clubId: profile?.clubId || "santa-cruz", refetch };
}
