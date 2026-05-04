"use client";

/**
 * useIsAdmin — boolean admin flag for the W48 Nourish-
 * verification approval flow.
 *
 * V1 vibecode: Stefan-only. The flag lives in localStorage at
 * `sous-is-admin` and the user (Stefan) sets it manually in
 * devtools. A dev-only "Become admin" toggle ships in the
 * profile settings sheet so the demo path doesn't require
 * console hands.
 *
 * Y2 W1+ swap: tied to the auth user's role on the server
 * (e.g. Clerk org membership). The hook signature stays the
 * same; the storage source changes underneath.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "sous-is-admin";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setIsAdmin(raw === "true");
    } catch {
      setIsAdmin(false);
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setEnabled = useCallback((enabled: boolean) => {
    setIsAdmin(enabled);
    try {
      if (enabled) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore — quota / privacy mode
    }
  }, []);

  return { isAdmin, mounted, setEnabled };
}
