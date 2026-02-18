"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { ComboBox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ROUTES,
  PROJECTS,
  LANGUAGES,
  COUNTRY_CODES,
  NTOC_OPTIONS,
} from "@/lib/constants";
import {
  Loader2,
  ListPlus,
  Globe,
  MapPin,
  Layers,
  Rocket,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  FileText,
} from "lucide-react";

interface BulkResult {
  total: number;
  created: number;
  failed: number;
  results: { keyword: string; success: boolean; error?: string }[];
}

export default function KeywordsPage() {
  const [keywordsText, setKeywordsText] = useState("");
  const [project, setProject] = useState("");
  const [language, setLanguage] = useState("English");
  const [countryCode, setCountryCode] = useState("us");
  const [ntoc, setNtoc] = useState("5");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  const keywords = keywordsText
    .split("\n")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const selectedLang = LANGUAGES.find((l) => l.value === language);
  // project is now a label string from ComboBox
  const selectedProject = PROJECTS.find((p) => p.label === project);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (keywords.length === 0) {
      toast.error("Enter at least one keyword");
      return;
    }

    if (keywords.length > 50) {
      toast.error("Maximum 50 keywords per batch");
      return;
    }

    if (!project) {
      toast.error("Please select a project");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      toast.loading(`Creating ${keywords.length} blog(s)...`, {
        id: "bulk-create",
      });

      const response = await fetch("/api/keywords/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keywords,
          Project: project,
          Language: language,
          Language_Code: selectedLang?.code || "en",
          Country_Code: countryCode,
          NTOC: ntoc,
          "Needs Approval?": needsApproval,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const r = data.data as BulkResult;
        setResult(r);
        if (r.failed === 0) {
          toast.success(`All ${r.created} blog(s) created!`, {
            id: "bulk-create",
          });
        } else {
          toast.warning(
            `${r.created} created, ${r.failed} failed`,
            { id: "bulk-create" }
          );
        }
      } else {
        toast.error(data.error || "Failed to create blogs", {
          id: "bulk-create",
        });
      }
    } catch {
      toast.error("Failed to create blogs", { id: "bulk-create" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setKeywordsText("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
              <ListPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bulk Keywords</h1>
              <p className="text-violet-200/80 text-sm">
                Create multiple blogs at once from a list of keywords
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <h2 className="text-lg font-semibold">Results</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.created}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl text-center">
                <p className="text-2xl font-bold text-red-600">
                  {result.failed}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {result.results.some((r) => !r.success) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed keywords:
                </p>
                {result.results
                  .filter((r) => !r.success)
                  .map((r, i) => (
                    <div
                      key={i}
                      className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm"
                    >
                      <span className="font-medium">{r.keyword}</span>
                      {r.error && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {r.error}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Create More
              </Button>
              <Link href={ROUTES.BLOGS}>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  View Blogs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {!result && (
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Keywords Textarea */}
              <div className="space-y-2">
                <Label htmlFor="keywords" required>
                  Keywords (one per line)
                </Label>
                <Textarea
                  id="keywords"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder={"best coffee makers 2024\nhow to brew espresso\ncoffee grinder reviews"}
                  rows={8}
                  disabled={isSubmitting}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}{" "}
                  detected
                  {keywords.length > 50 && (
                    <span className="text-red-500 ml-2">
                      (max 50 per batch)
                    </span>
                  )}
                </p>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="project" required>
                  Project
                </Label>
                <ComboBox
                  id="project"
                  value={project}
                  onChange={setProject}
                  placeholder="Search or add project..."
                  disabled={isSubmitting}
                  icon={<Rocket className="w-5 h-5" />}
                  options={PROJECTS.map((p) => ({
                    value: p.label,
                    label: p.label,
                  }))}
                />
              </div>

              {/* Language, Country, Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Dropdown
                    id="language"
                    value={language}
                    onChange={setLanguage}
                    disabled={isSubmitting}
                    icon={<Globe className="w-5 h-5" />}
                    options={LANGUAGES.map((lang) => ({
                      value: lang.value,
                      label: lang.label,
                    }))}
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
                    options={COUNTRY_CODES.map((c) => ({
                      value: c.value,
                      label: c.label,
                    }))}
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
                    options={NTOC_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                  />
                </div>
              </div>

              {/* Needs Approval */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  needsApproval
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-muted/30 border-border/50 hover:border-amber-500/30"
                }`}
              >
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
                    <label
                      htmlFor="needsApproval"
                      className="flex items-center gap-2 font-medium text-sm cursor-pointer"
                    >
                      <ShieldCheck
                        className={`w-4 h-4 ${needsApproval ? "text-amber-600" : "text-muted-foreground"}`}
                      />
                      Needs Approval
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require manual review before publishing
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                disabled={isSubmitting || keywords.length === 0 || keywords.length > 50}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Create {keywords.length} Blog{keywords.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
