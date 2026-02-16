"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Blogs",
    href: ROUTES.BLOGS,
    icon: FileText,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    label: "Add Blog",
    href: ROUTES.BLOG_NEW,
    icon: Plus,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    label: "Projects",
    href: ROUTES.PROJECTS,
    icon: FolderKanban,
    gradient: "from-amber-500 to-orange-600",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-all duration-300 ease-out",
          // Desktop behavior
          "md:translate-x-0",
          isCollapsed ? "md:w-[72px]" : "md:w-64",
          // Mobile behavior
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex items-center h-16 border-b border-border/50 relative",
          isCollapsed ? "px-3 justify-center" : "px-5"
        )}>
          <Link
            href={ROUTES.DASHBOARD}
            className={cn(
              "flex items-center gap-3 group",
              isCollapsed && "md:justify-center"
            )}
            onClick={closeMobile}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            </div>
            <span className={cn(
              "font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-300",
              isCollapsed && "md:hidden"
            )}>
              SEOBlackBox
            </span>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isCollapsed && "md:justify-center md:px-0",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r rounded-xl shadow-lg transition-all duration-300",
                    item.gradient,
                    `shadow-${item.gradient.split(" ")[0].replace("from-", "")}/25`
                  )} />
                )}

                {/* Icon */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20"
                    : "bg-muted/50 group-hover:bg-muted"
                )}>
                  <item.icon className={cn(
                    "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : ""
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  "relative z-10 transition-all duration-300",
                  isCollapsed && "md:hidden"
                )}>
                  {item.label}
                </span>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-card border border-border rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 hidden md:block">
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-card border-l border-b border-border rotate-45" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        <div className="hidden md:block p-3 border-t border-border/50">
          <button
            onClick={toggleCollapse}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              {isCollapsed ? (
                <ChevronRight className="w-[18px] h-[18px]" />
              ) : (
                <ChevronLeft className="w-[18px] h-[18px]" />
              )}
            </div>
            <span className={cn(
              "transition-all duration-300",
              isCollapsed && "md:hidden"
            )}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
