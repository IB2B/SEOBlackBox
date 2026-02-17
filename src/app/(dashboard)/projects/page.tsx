"use client";

import Link from "next/link";
import { useTracking } from "@/hooks/useSWR";
import { ClientTracker } from "@/components/dashboard/ClientTracker";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Plus, FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const { data: trackingData, isLoading, error } = useTracking();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl">
              <FolderKanban className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            Projects
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View and manage your blog posts by project
          </p>
        </div>
        <Link href={ROUTES.BLOG_NEW}>
          <Button size="lg" className="w-full md:w-auto gap-2">
            <Plus className="w-5 h-5" />
            Add Blog
          </Button>
        </Link>
      </div>

      {/* Client Tracker - Same as Dashboard */}
      <ClientTracker data={trackingData} isLoading={isLoading} />
    </div>
  );
}
