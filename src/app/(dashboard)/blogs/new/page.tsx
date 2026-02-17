"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES, PROJECTS, LANGUAGES, COUNTRY_CODES, NTOC_OPTIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Sparkles,
  FileText,
  Globe,
  MapPin,
  Layers,
  Zap,
  ArrowLeft,
  Rocket,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function NewBlogPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [project, setProject] = useState("");
  const [language, setLanguage] = useState("English");
  const [countryCode, setCountryCode] = useState("us");
  const [ntoc, setNtoc] = useState("5");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedLang = LANGUAGES.find((l) => l.value === language);
  const selectedProject = PROJECTS.find((p) => p.value === project);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyword.trim()) {
      toast.error("Keyword is required");
      return;
    }

    if (!project) {
      toast.error("Please select a project");
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Creating keyword...", { id: "create-blog" });

      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          Keywords: keyword.trim(),
          Project: selectedProject?.label || project,
          Language: language,
          Language_Code: selectedLang?.code || "en",
          Country_Code: countryCode,
          NTOC: ntoc,
          STEPS: "Parking",
          "Needs Approval?": needsApproval,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const blogId = data.data.id;
        toast.success("Keyword created!", { id: "create-blog" });

        for (let i = 3; i > 0; i--) {
          setCountdown(i);
          toast.loading(`Starting Auto Pilot in ${i}...`, { id: "auto-pilot" });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);

        const updateResponse = await fetch(`/api/blogs/${blogId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            STEPS: "Auto Pilot",
          }),
        });

        if (!updateResponse.ok) {
          // Failed to set Auto Pilot, continuing anyway
        }

        toast.success("Auto Pilot activated!", { id: "auto-pilot" });
        router.push(ROUTES.BLOG_EDIT(blogId));
      } else {
        toast.error(data.error || "Failed to create blog", { id: "create-blog" });
        setError(data.error || "Failed to create blog");
      }
    } catch (err) {
      toast.error("Failed to create blog", { id: "create-blog" });
      setError("Failed to create blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href={ROUTES.BLOGS} className="inline-flex items-center gap-2 text-violet-300 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create New Blog</h1>
              <p className="text-violet-200/80 text-sm">
                Enter a keyword and let AI generate your content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <span className="text-red-500 text-lg">!</span>
                </div>
                {error}
              </div>
            )}

            {/* Row 1: Keyword & Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keyword" required>Target Keyword</Label>
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., best coffee makers 2024"
                  required
                  disabled={isSubmitting}
                  icon={<FileText className="w-5 h-5" />}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project" required>Project</Label>
                <Dropdown
                  id="project"
                  value={project}
                  onChange={setProject}
                  placeholder="Select a project"
                  disabled={isSubmitting}
                  icon={<Rocket className="w-5 h-5" />}
                  options={PROJECTS.map((p) => ({ value: p.value, label: p.label }))}
                />
              </div>
            </div>

            {/* Row 2: Language, Country, Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Dropdown
                  id="language"
                  value={language}
                  onChange={setLanguage}
                  disabled={isSubmitting}
                  icon={<Globe className="w-5 h-5" />}
                  options={LANGUAGES.map((lang) => ({ value: lang.value, label: lang.label }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Dropdown
                  id="country"
                  value={countryCode}
                  onChange={setCountryCode}
                  disabled={isSubmitting}
                  icon={<MapPin className="w-5 h-5" />}
                  options={COUNTRY_CODES.map((c) => ({ value: c.value, label: c.label }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ntoc">Sections</Label>
                <Dropdown
                  id="ntoc"
                  value={ntoc}
                  onChange={setNtoc}
                  disabled={isSubmitting}
                  icon={<Layers className="w-5 h-5" />}
                  options={NTOC_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auto Pilot Info */}
              <div className="p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl flex items-center">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-lg shrink-0">
                    <Zap className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-violet-900 dark:text-violet-100">Auto Pilot Mode</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your blog will automatically start generating content using AI.
                    </p>
                  </div>
                </div>
              </div>

              {/* Needs Approval */}
              <div className={`p-4 rounded-xl border transition-colors ${
                needsApproval
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-muted/30 border-border/50 hover:border-amber-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox
                      id="needsApproval"
                      checked={needsApproval}
                      onChange={(e) => setNeedsApproval(e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="needsApproval" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                      <ShieldCheck className={`w-4 h-4 ${needsApproval ? "text-amber-600" : "text-muted-foreground"}`} />
                      Needs Approval
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require manual review before publishing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {countdown ? `Starting in ${countdown}...` : "Creating..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Create Blog
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
