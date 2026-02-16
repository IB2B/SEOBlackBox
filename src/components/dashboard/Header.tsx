"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Menu,
  LogOut,
  User,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useRef, useEffect, FormEvent } from "react";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus mobile search input when opened
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  // Handle search submit
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.BLOGS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowMobileSearch(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 w-full">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />

      <div className="relative flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-transparent focus-within:border-primary/30 focus-within:bg-muted transition-all duration-200 w-72 lg:w-80">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs, projects..."
                className="bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground w-full"
              />
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background rounded border border-border">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-muted/50 transition-all duration-200 active:scale-[0.98]"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="text-white text-sm font-semibold">{initials}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background" />
              </div>

              {/* Name - Desktop */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {user?.email?.split("@")[0]}
                </span>
              </div>

              <ChevronDown className={cn(
                "hidden md:block w-4 h-4 text-muted-foreground transition-transform duration-200",
                showUserMenu && "rotate-180"
              )} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-slide-down">
                {/* User Info */}
                <div className="p-4 border-b border-border/50">
                  <p className="font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-border/50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden absolute inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 animate-slide-down">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus-within:border-primary/50">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={mobileSearchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs, projects..."
                className="bg-transparent border-none outline-none text-base placeholder:text-muted-foreground w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery("");
              }}
              className="p-3 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
