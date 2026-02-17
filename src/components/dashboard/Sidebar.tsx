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
    exact: true,
  },
  {
    label: "Blogs",
    href: ROUTES.BLOGS,
    icon: FileText,
    exact: false,
    excludes: [ROUTES.BLOG_NEW],
  },
  {
    label: "Add Blog",
    href: ROUTES.BLOG_NEW,
    icon: Plus,
    exact: true,
  },
  {
    label: "Projects",
    href: ROUTES.PROJECTS,
    icon: FolderKanban,
    exact: false,
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-border/40 transition-all duration-300",
          "md:translate-x-0",
          isCollapsed ? "md:w-[68px]" : "md:w-60",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-14 border-b border-border/40",
          isCollapsed ? "px-3 justify-center" : "px-4"
        )}>
          <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-2.5"
            onClick={closeMobile}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-base">SEOBlackBox</span>
            )}
          </Link>

          {/* Mobile Close */}
          <button
            onClick={closeMobile}
            className="absolute right-3 p-1.5 rounded-md hover:bg-muted md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isExcluded = item.excludes?.some(path => pathname.startsWith(path));
            const isActive = item.exact
              ? pathname === item.href
              : !isExcluded && (pathname === item.href || pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  isCollapsed && "justify-center px-3",
                  isActive
                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-violet-600 dark:text-violet-400"
                )} />

                {!isCollapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap hidden md:block">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="hidden md:block p-3 border-t border-border/40">
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors",
              isCollapsed && "justify-center px-3"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
