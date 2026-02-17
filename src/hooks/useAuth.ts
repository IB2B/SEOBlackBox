"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User, LoginCredentials, AuthResponse } from "@/types";
import { API_ROUTES, ROUTES } from "@/lib/constants";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state by checking with server (HttpOnly cookie sent automatically)
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(API_ROUTES.AUTH.ME, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setState({
              user: data.data,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
      } catch {
        // Auth check failed - user is not authenticated
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    checkAuth();
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
          credentials: "include",
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Login failed");
        }

        const { user } = data.data as AuthResponse;
        setState({
          user,
          isLoading: false,
          error: null,
        });
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
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(API_ROUTES.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors - redirect regardless
    }
    setState({
      user: null,
      isLoading: false,
      error: null,
    });
    toast.success("Logged out successfully");
    router.push(ROUTES.LOGIN);
  }, [router]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    error: state.error,
    login,
    logout,
    clearError,
  };
}
