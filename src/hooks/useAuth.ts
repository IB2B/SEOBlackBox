"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User, LoginCredentials, AuthResponse } from "@/types";
import { API_ROUTES, ROUTES } from "@/lib/constants";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          user,
          token,
          isLoading: false,
          error: null,
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const setAuth = useCallback((token: string, user: User) => {
    // Store minimal user info in sessionStorage (more secure than localStorage)
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    // Also keep in localStorage for persistence across sessions
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    // Note: HttpOnly cookie is set by the server - do not set from client
    setState({
      user,
      token,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearAuth = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // Call logout API to clear HttpOnly cookie
    try {
      await fetch(API_ROUTES.AUTH.LOGOUT, { method: "POST" });
    } catch {
      // Ignore errors - local state is cleared regardless
    }
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      toast.loading("Signing in...", { id: "login" });

      try {
        const response = await fetch(API_ROUTES.AUTH.LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Login failed");
        }

        const { token, user } = data.data as AuthResponse;
        setAuth(token, user);
        toast.success(`Welcome back, ${user.name}!`, { id: "login" });
        router.push(ROUTES.DASHBOARD);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Login failed";
        toast.error(message, { id: "login" });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        return false;
      }
    },
    [router, setAuth]
  );

  const logout = useCallback(async () => {
    await clearAuth();
    toast.success("Logged out successfully");
    router.push(ROUTES.LOGIN);
  }, [clearAuth, router]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: !!state.token,
    error: state.error,
    login,
    logout,
    clearError,
  };
}
