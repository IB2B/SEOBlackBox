"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { Loader2, Mail, Lock, Sparkles, AlertCircle, X } from "lucide-react";

// Validation helper
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const validation = useMemo(() => ({
    email: {
      valid: isValidEmail(email),
      message: "Please enter a valid email address",
    },
    password: {
      valid: password.length > 0,
      message: "Password is required",
    },
  }), [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setTouched({ email: true, password: true });

    if (!validation.email.valid || !validation.password.valid) {
      return;
    }

    await login({ email, password });
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl opacity-20 blur-xl" />
        </div>
      </div>

      <Card variant="glass" className="border-0 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your SEOBlackBox account
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {error && (
              <div className="flex items-start gap-3 p-4 text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-scale-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                required
                disabled={isLoading}
                icon={<Mail className="w-4 h-4" />}
                className={`h-12 ${touched.email && !validation.email.valid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={touched.email && !validation.email.valid}
                aria-describedby={touched.email && !validation.email.valid ? "email-error" : undefined}
              />
              {touched.email && email && !validation.email.valid && (
                <p id="email-error" className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                  <X className="w-3 h-3" />
                  {validation.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                required
                disabled={isLoading}
                icon={<Lock className="w-4 h-4" />}
                className="h-12"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

          </CardFooter>
        </form>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        By signing in, you agree to our{" "}
        <Link href="#" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
