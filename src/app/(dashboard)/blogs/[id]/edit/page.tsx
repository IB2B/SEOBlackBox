"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BlogPreviewEditable } from "@/components/blogs/BlogPreviewEditable";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { useBlogStream } from "@/hooks/useBlogStream";
import { ROUTES, USER_EDITABLE_STATUSES, BLOG_STATUSES } from "@/lib/constants";
import { useNotificationContext } from "@/components/notifications";
import { sendBlogReadyNotification, sendBlogUpdatedNotification } from "@/lib/notifications";
import { compileBlogBody } from "@/lib/bodyCompiler";
import type { Blog, BlogStatus } from "@/types";
import { ArrowLeft, Loader2, Radio, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// Human-readable labels for Baserow field names
const FIELD_LABELS: Record<string, string> = {
  TITLE: "Title",
  Permalink: "Permalink",
  "META DESC": "Meta Description",
  INTRODUCTION: "Introduction",
  CONCLUSION: "Conclusion",
  "TL;DR": "TL;DR",
  "Section 1": "Section 1",
  "Section 2": "Section 2",
  "Section 3": "Section 3",
  "Section 4": "Section 4",
  "Section 5": "Section 5",
  "Section 6": "Section 6",
  "Section 7": "Section 7",
  FAQ: "FAQ",
  "images URL": "Image URL",
  STEPS: "Status",
  "Needs Approval?": "Needs Approval",
  "Article Category": "Category",
  BODY: "Body",
};

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = Number(params.id);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidebar-style fields (status, category, approval)
  const [steps, setSteps] = useState<BlogStatus>("PARKING");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [articleCategory, setArticleCategory] = useState("");

  // Notification context for push notifications on save
  const { isEnabled: notifEnabled, permission: notifPermission } = useNotificationContext();

  // Guard against concurrent saves
  const isAutoSavingRef = useRef(false);

  // Track the latest blog content for BODY compilation
  const latestContentRef = useRef<Partial<Blog>>({});

  // Update sidebar fields from blog data
  const updateSidebarFromBlog = useCallback((b: Blog) => {
    setSteps(b.STEPS);
    setNeedsApproval(b["Needs Approval?"] || false);
    setArticleCategory(b["Article Category"] || "");
  }, []);

  // Handle polling updates
  const handlePollingUpdate = useCallback((newBlog: Blog, prevStep: BlogStatus | null, changedFields: string[]) => {
    // Show toast when step changes
    if (prevStep && prevStep !== newBlog.STEPS) {
      toast.info(`Generation step: ${newBlog.STEPS}`, { duration: 2000 });

      // Send "Ready to Publish" push notification when blog reaches Full status
      if (newBlog.STEPS === "Full" && notifEnabled && notifPermission === "granted") {
        const blogName = newBlog.TITLE || newBlog.Keywords || "Untitled Blog";
        sendBlogReadyNotification(blogName, blogId, (id) => {
          router.push(ROUTES.BLOG_EDIT(id));
        });
      }
    }

    // Show toast for content field updates
    if (changedFields.length > 0) {
      const labels = changedFields.map(f => FIELD_LABELS[f] || f).slice(0, 3);
      const moreCount = changedFields.length > 3 ? ` +${changedFields.length - 3} more` : "";
      toast.success(`Updated: ${labels.join(", ")}${moreCount}`, { duration: 2000 });
    }

    // Update sidebar fields from polling
    updateSidebarFromBlog(newBlog);

    // Update latest content ref with polled data
    latestContentRef.current = {
      ...latestContentRef.current,
      "TL;DR": newBlog["TL;DR"],
      INTRODUCTION: newBlog.INTRODUCTION,
      "Section 1": newBlog["Section 1"],
      "Section 2": newBlog["Section 2"],
      "Section 3": newBlog["Section 3"],
      "Section 4": newBlog["Section 4"],
      "Section 5": newBlog["Section 5"],
      "Section 6": newBlog["Section 6"],
      "Section 7": newBlog["Section 7"],
      FAQ: newBlog.FAQ,
      CONCLUSION: newBlog.CONCLUSION,
    };
  }, [updateSidebarFromBlog, blogId, notifEnabled, notifPermission, router]);

  // Check if blog is finished (BODY is filled)
  const isBlogFinished = !!(blog?.BODY && blog.BODY.trim() !== "");

  // Real-time polling connection
  const { blog: polledBlog, isConnected, isGenerating, error: streamError, refetch } = useBlogStream({
    blogId,
    enabled: !isNaN(blogId) && !isBlogFinished,
    pollingInterval: 3000,
    onUpdate: handlePollingUpdate,
  });

  // Update blog state from polling
  useEffect(() => {
    if (polledBlog) {
      setBlog(polledBlog);
      if (isLoading) {
        updateSidebarFromBlog(polledBlog);
        // Initialize latest content ref
        latestContentRef.current = {
          "TL;DR": polledBlog["TL;DR"],
          INTRODUCTION: polledBlog.INTRODUCTION,
          "Section 1": polledBlog["Section 1"],
          "Section 2": polledBlog["Section 2"],
          "Section 3": polledBlog["Section 3"],
          "Section 4": polledBlog["Section 4"],
          "Section 5": polledBlog["Section 5"],
          "Section 6": polledBlog["Section 6"],
          "Section 7": polledBlog["Section 7"],
          FAQ: polledBlog.FAQ,
          CONCLUSION: polledBlog.CONCLUSION,
        };
        setIsLoading(false);
      }
    }
  }, [polledBlog, isLoading, updateSidebarFromBlog]);

  // Compile BODY from current content
  const compileBody = useCallback((overrides?: Partial<Blog>): string => {
    const merged = { ...latestContentRef.current, ...overrides };
    return compileBlogBody({
      introduction: (merged.INTRODUCTION as string) || "",
      tldr: (merged["TL;DR"] as string) || "",
      section1: (merged["Section 1"] as string) || "",
      section2: (merged["Section 2"] as string) || "",
      section3: (merged["Section 3"] as string) || "",
      section4: (merged["Section 4"] as string) || "",
      section5: (merged["Section 5"] as string) || "",
      section6: (merged["Section 6"] as string) || "",
      section7: (merged["Section 7"] as string) || "",
      faq: (merged.FAQ as string) || "",
      conclusion: (merged.CONCLUSION as string) || "",
    });
  }, []);

  // Direct save to Baserow: called when BlogPreviewEditable fires onFieldChange (on Apply)
  const handleFieldChange = useCallback(async (updatedContent: Partial<Blog>) => {
    // Skip if published or generating
    if (steps === "PUBLISH" || isGenerating) return;
    if (isAutoSavingRef.current) return;
    isAutoSavingRef.current = true;

    // Update latest content ref for BODY compilation
    latestContentRef.current = { ...latestContentRef.current, ...updatedContent };

    // Compile BODY from all current sections
    const compiledBody = compileBody(updatedContent);

    // Build the payload: changed fields + compiled BODY + sidebar fields
    const payload: Record<string, unknown> = {
      ...updatedContent,
      BODY: compiledBody,
      STEPS: steps,
      "Needs Approval?": needsApproval,
      "Article Category": articleCategory,
    };

    // Also sync image fields
    if (updatedContent["images URL"] !== undefined) {
      payload["image 1"] = updatedContent["images URL"] || null;
    }

    const toastId = `save-field-${Date.now()}`;
    const changedLabels = Object.keys(updatedContent)
      .map(f => FIELD_LABELS[f] || f)
      .slice(0, 3);
    const more = Object.keys(updatedContent).length > 3
      ? ` +${Object.keys(updatedContent).length - 3} more`
      : "";
    toast.loading(`Saving ${changedLabels.join(", ")}${more}...`, { id: toastId });

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Saved: ${changedLabels.join(", ")}${more}`, { id: toastId, duration: 2000 });

        // Update blog state from API response
        setBlog(data.data);
      } else {
        toast.error(`Failed to save: ${data.error || "Unknown error"}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to save to Baserow", { id: toastId });
    } finally {
      isAutoSavingRef.current = false;
    }
  }, [blogId, steps, needsApproval, articleCategory, isGenerating, compileBody]);

  // Manual save (Save/Publish button)
  const handleSave = useCallback(async (updatedBlog: Partial<Blog>, newStatus?: BlogStatus) => {
    setIsSaving(true);
    setError(null);

    const toastId = newStatus === "PUBLISH" ? "publish-blog" : "save-blog";
    toast.loading(newStatus === "PUBLISH" ? "Publishing..." : "Saving...", { id: toastId });

    // Update latest content ref with all fields from the component
    latestContentRef.current = { ...latestContentRef.current, ...updatedBlog };

    // Compile BODY from all current sections
    const compiledBody = compileBody(updatedBlog);

    try {
      const payload: Record<string, unknown> = {
        ...updatedBlog,
        BODY: compiledBody,
        STEPS: newStatus || steps,
        "Needs Approval?": needsApproval,
        "Article Category": articleCategory,
      };

      // Sync image fields
      if (updatedBlog["images URL"] !== undefined) {
        payload["image 1"] = updatedBlog["images URL"] || null;
      }

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
        setSteps(data.data.STEPS);
        if (newStatus === "PUBLISH") {
          toast.success("Blog sent for publishing! n8n will handle WordPress.", { id: toastId });
        } else {
          toast.success("Blog saved successfully!", { id: toastId });
        }

        // Send push notification
        if (notifEnabled && notifPermission === "granted") {
          const changedLabels = Object.keys(updatedBlog).map(f => FIELD_LABELS[f] || f);
          if (newStatus) changedLabels.push("Status");
          const blogName = data.data.TITLE || blog?.Keywords || "Untitled Blog";
          sendBlogUpdatedNotification(blogName, blogId, changedLabels, (id) => {
            router.push(ROUTES.BLOG_EDIT(id));
          });
        }
      } else {
        toast.error(data.error || "Failed to save blog", { id: toastId });
        setError(data.error || "Failed to save blog");
      }
    } catch {
      toast.error("Failed to save blog", { id: toastId });
      setError("Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  }, [blogId, steps, needsApproval, articleCategory, compileBody, blog, notifEnabled, notifPermission, router]);

  const canEdit = (USER_EDITABLE_STATUSES as readonly string[]).includes(steps);
  const isPublished = steps === "PUBLISH";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href={ROUTES.BLOGS}>
          <Button>Back to Blogs</Button>
        </Link>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.BLOGS}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Blog</h1>
            <p className="text-muted-foreground">
              Keyword: {blog.Keywords} | Project: {blog.Project}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Live connection indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              isConnected
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            )}
          >
            <Radio
              className={cn(
                "w-3 h-3",
                isConnected && "animate-pulse"
              )}
            />
            {isConnected ? "Live" : "Offline"}
          </div>
          <StatusBadge status={blog.STEPS} />
        </div>
      </div>

      {/* Published banner */}
      {isPublished && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 dark:text-violet-100">
              Blog is Published
            </h3>
            <p className="text-sm text-violet-700 dark:text-violet-300">
              This blog has been published and cannot be edited. Create a new blog to make changes.
            </p>
          </div>
        </div>
      )}

      {/* Blog finished badge */}
      {!isPublished && blog.BODY && blog.BODY.trim() !== "" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-emerald-500/20">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
              Blog is finished
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Content generation complete. Ready to publish.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {streamError && (
        <div className="p-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <span>{streamError}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Status / Category / Approval controls */}
      {!isPublished && (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="steps" className="text-xs">Status (STEPS)</Label>
            <Select
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value as BlogStatus)}
              disabled={!canEdit || isPublished}
              className="h-9"
            >
              {BLOG_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="articleCategory" className="text-xs">Category</Label>
            <Input
              id="articleCategory"
              value={articleCategory}
              onChange={(e) => setArticleCategory(e.target.value)}
              placeholder="e.g., Technology"
              className="h-9 w-[180px]"
              disabled={isPublished}
            />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <input
              type="checkbox"
              id="needsApproval"
              checked={needsApproval}
              onChange={(e) => setNeedsApproval(e.target.checked)}
              className="rounded border-gray-300"
              disabled={isPublished}
            />
            <Label htmlFor="needsApproval" className="text-xs cursor-pointer">
              Needs Approval?
            </Label>
          </div>
        </div>
      )}

      {/* Preview-style editable content */}
      <BlogPreviewEditable
        blog={blog}
        onSave={handleSave}
        onFieldChange={handleFieldChange}
        isSaving={isSaving}
        readOnly={isPublished}
      />
    </div>
  );
}
