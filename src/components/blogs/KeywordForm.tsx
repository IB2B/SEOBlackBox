"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, PROJECTS, LANGUAGES, COUNTRY_CODES, NTOC_OPTIONS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function KeywordForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [project, setProject] = useState("");
  const [language, setLanguage] = useState("English");
  const [countryCode, setCountryCode] = useState("us");
  const [ntoc, setNtoc] = useState("5");
  const [steps, setSteps] = useState<"PARKING" | "Auto Pilot">("PARKING");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [location, setLocation] = useState("");
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
      // Step 1: Create blog with PARKING
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
          STEPS: "Parking", // Match exact Baserow option label
          "Needs Approval?": needsApproval,
          Location: location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const blogId = data.data.id;
        toast.success("Keyword created!", { id: "create-blog" });

        // Step 2: Wait 3 seconds with countdown
        for (let i = 3; i > 0; i--) {
          setCountdown(i);
          toast.loading(`Setting Auto Pilot in ${i}s...`, { id: "auto-pilot" });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);

        // Step 3: Update to Auto Pilot
        setSteps("Auto Pilot");
        const updateResponse = await fetch(`/api/blogs/${blogId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            STEPS: "Auto Pilot", // This matches Baserow option exactly
          }),
        });

        if (!updateResponse.ok) {
          // Failed to set Auto Pilot, continuing anyway
        }

        toast.success("Auto Pilot activated! n8n will process this keyword.", { id: "auto-pilot" });
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
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Add New Keyword</CardTitle>
        <CardDescription>
          Create a new blog post by entering a target keyword. The content will
          be generated automatically if you set STEPS to Auto Pilot.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword *</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter target keyword (e.g., best coffee makers 2024)"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This will be the main topic for your blog post
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">Select a project</option>
              {PROJECTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isSubmitting}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                id="country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={isSubmitting}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntoc">Number of Sections</Label>
            <Select
              id="ntoc"
              value={ntoc}
              onChange={(e) => setNtoc(e.target.value)}
              disabled={isSubmitting}
            >
              {NTOC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Number of content sections to generate for the article
            </p>
          </div>

          {/* Auto Pilot Mode Toggle */}
          <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/20">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Checkbox
                  id="autoPilot"
                  checked={steps === "Auto Pilot"}
                  onChange={(e) => setSteps(e.target.checked ? "Auto Pilot" : "PARKING")}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="autoPilot" className="block font-medium text-sm cursor-pointer">
                  Auto Pilot Mode
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your blog will automatically start generating content using AI
                </p>
              </div>
            </div>
          </div>

          {/* Needs Approval Toggle */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20">
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
                <label htmlFor="needsApproval" className="block font-medium text-sm cursor-pointer">
                  Needs Approval
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Content will require manual approval before publishing
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {countdown ? `Setting Auto Pilot in ${countdown}s...` : "Creating..."}
              </>
            ) : (
              "Create Blog"
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
