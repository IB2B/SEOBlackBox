"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";
import {
  FileText,
  CheckCircle,
  Zap,
  ParkingCircle,
  Send,
  FolderKanban,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Blogs",
      value: stats?.totalBlogs ?? 0,
      icon: FileText,
      iconColor: "text-white",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-500/5",
      textGradient: "from-violet-600 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
    {
      title: "Completed",
      value: stats?.completedBlogs ?? 0,
      icon: CheckCircle,
      iconColor: "text-white",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-500/5",
      textGradient: "from-green-600 to-emerald-600",
      shadow: "shadow-green-500/25",
    },
    {
      title: "Auto Pilot",
      value: stats?.autopilotBlogs ?? 0,
      icon: Zap,
      iconColor: "text-white",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      textGradient: "from-amber-600 to-orange-600",
      shadow: "shadow-amber-500/25",
    },
    {
      title: "Parking",
      value: stats?.parkingBlogs ?? 0,
      icon: ParkingCircle,
      iconColor: "text-white",
      gradient: "from-rose-500 to-red-600",
      bgGradient: "from-rose-500/10 to-red-500/5",
      textGradient: "from-rose-600 to-red-600",
      shadow: "shadow-rose-500/25",
    },
    {
      title: "Publish",
      value: stats?.publishBlogs ?? 0,
      icon: Send,
      iconColor: "text-white",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      textGradient: "from-emerald-600 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      title: "Projects",
      value: stats?.projects ?? 0,
      icon: FolderKanban,
      iconColor: "text-white",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-500/10 to-blue-500/5",
      textGradient: "from-indigo-600 to-blue-600",
      shadow: "shadow-indigo-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`border-0 bg-gradient-to-br ${card.bgGradient} hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow}`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className={`text-2xl font-bold bg-gradient-to-r ${card.textGradient} bg-clip-text text-transparent`}>
                {card.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
