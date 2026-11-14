import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, endpoints } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await endpoints.me();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    endpoints
      .me()
      .then(({ data }) => {
        if (alive) setUser(data.user);
      })
      .catch(() => {
        if (alive) setUser(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener("sabisafe:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("sabisafe:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await endpoints.login({ email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await endpoints.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await endpoints.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateLocalUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, updateLocalUser }),
    [user, loading, login, register, logout, refresh, updateLocalUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export { AuthContext, api };
