"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import {
  Loader2,
  Sparkles,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ParkingBlog {
  id: number;
  Keywords: string;
  Project: string;
  Language: string;
}

export default function NewBlogPage() {
  const router = useRouter();
  const [parkingBlogs, setParkingBlogs] = useState<ParkingBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch PARKING keywords on mount
  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await fetch("/api/blogs?status=5133&size=200", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setParkingBlogs(data.data.blogs);
        }
      } catch {
        toast.error("Failed to load parking keywords");
      } finally {
        setIsLoading(false);
      }
    };
    fetchParking();
  }, []);

  const selectedBlog = parkingBlogs.find(
    (b) => String(b.id) === selectedBlogId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBlogId) {
      toast.error("Please select a keyword");
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Starting Auto Pilot...", { id: "auto-pilot" });

      const response = await fetch(`/api/blogs/${selectedBlogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ STEPS: "Auto Pilot" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Auto Pilot activated!", { id: "auto-pilot" });
        router.push(ROUTES.BLOG_EDIT(Number(selectedBlogId)));
      } else {
        toast.error(data.error || "Failed to start Auto Pilot", {
          id: "auto-pilot",
        });
        setError(data.error || "Failed to start Auto Pilot");
      }
    } catch {
      toast.error("Failed to start Auto Pilot", { id: "auto-pilot" });
      setError("Failed to start Auto Pilot");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build options for the combobox
  const keywordOptions = parkingBlogs.map((b) => ({
    value: String(b.id),
    label: `${b.Keywords}  —  ${b.Project}`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link
            href={ROUTES.BLOGS}
            className="inline-flex items-center gap-2 text-violet-300 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Add Blog</h1>
              <p className="text-violet-200/80 text-sm">
                Select a keyword from parking to start Auto Pilot
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              <span className="ml-3 text-muted-foreground">
                Loading parking keywords...
              </span>
            </div>
          ) : parkingBlogs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No keywords in parking. Add keywords first.
              </p>
              <Link href={ROUTES.KEYWORDS}>
                <Button>Go to Keywords</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <div className="p-1 bg-red-100 rounded-full">
                    <span className="text-red-500 text-lg">!</span>
                  </div>
                  {error}
                </div>
              )}

              {/* Keyword Selection */}
              <div className="space-y-2">
                <Label htmlFor="keyword" required>
                  Select Keyword
                </Label>
                <ComboBox
                  id="keyword"
                  value={selectedBlogId}
                  onChange={setSelectedBlogId}
                  placeholder="Search parking keywords..."
                  disabled={isSubmitting}
                  icon={<FileText className="w-5 h-5" />}
                  options={keywordOptions}
                />
                <p className="text-sm text-muted-foreground">
                  {parkingBlogs.length} keyword
                  {parkingBlogs.length !== 1 ? "s" : ""} in parking
                </p>
              </div>

              {/* Selected keyword info */}
              {selectedBlog && (
                <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Keyword:</span>{" "}
                    <span className="font-medium">{selectedBlog.Keywords}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Project:</span>{" "}
                    <span className="font-medium">{selectedBlog.Project}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Language:</span>{" "}
                    <span className="font-medium">{selectedBlog.Language}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                disabled={isSubmitting || !selectedBlogId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Auto Pilot...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Start Auto Pilot
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
