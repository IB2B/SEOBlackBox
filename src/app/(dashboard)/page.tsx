"use client";

import Link from "next/link";
import { useTracking } from "@/hooks/useSWR";
import { useAuth } from "@/hooks/useAuth";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import {
  AlertCircle,
  Plus,
  FileText,
  ArrowRight,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { data: trackingData, isLoading, error } = useTracking();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{today}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}!
              </h1>
              <p className="text-violet-200/80 max-w-md">
                Your content generation dashboard. Track and manage all your blogs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.BLOG_NEW}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog
                </Button>
              </Link>
              <Link href={ROUTES.BLOGS}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  All Blogs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">Error loading data</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Section */}
      <DashboardTabs
        data={trackingData}
        isLoading={isLoading}
      />
    </div>
  );
}
