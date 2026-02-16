"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogEditor } from "@/components/blogs/BlogEditor";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { useBlogStream } from "@/hooks/useBlogStream";
import { ROUTES, USER_EDITABLE_STATUSES, BLOG_STATUSES } from "@/lib/constants";
import type { Blog, BlogStatus } from "@/types";
import { ArrowLeft, Save, Send, Loader2, ChevronDown, ChevronUp, Radio, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  title: string;
  content: string;
  onChange: (content: string) => void;
  defaultOpen?: boolean;
}

function SectionEditor({ title, content, onChange, defaultOpen = false }: SectionEditorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || !!content);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {content && (
            <span className="text-xs text-muted-foreground">Has content</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <BlogEditor content={content} onChange={onChange} placeholder={`Enter ${title.toLowerCase()} content...`} />
        </div>
      )}
    </div>
  );
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = Number(params.id);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state matching Baserow fields
  const [title, setTitle] = useState("");
  const [permalink, setPermalink] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [tldr, setTldr] = useState("");
  const [section1, setSection1] = useState("");
  const [section2, setSection2] = useState("");
  const [section3, setSection3] = useState("");
  const [section4, setSection4] = useState("");
  const [section5, setSection5] = useState("");
  const [section6, setSection6] = useState("");
  const [section7, setSection7] = useState("");
  const [faq, setFaq] = useState("");
  const [imagesUrl, setImagesUrl] = useState("");
  const [image3, setImage3] = useState("");
  const [steps, setSteps] = useState<BlogStatus>("PARKING");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [articleCategory, setArticleCategory] = useState("");

  // Update ALL form fields from blog data
  const updateFormFromBlog = useCallback((b: Blog) => {
    // Update ALL fields unconditionally
    setTitle(b.TITLE || "");
    setPermalink(b.Permalink || "");
    setMetaDesc(b["META DESC"] || "");
    setIntroduction(b.INTRODUCTION || "");
    setConclusion(b.CONCLUSION || "");
    setTldr(b["TL;DR"] || "");
    setSection1(b["Section 1"] || "");
    setSection2(b["Section 2"] || "");
    setSection3(b["Section 3"] || "");
    setSection4(b["Section 4"] || "");
    setSection5(b["Section 5"] || "");
    setSection6(b["Section 6"] || "");
    setSection7(b["Section 7"] || "");
    setFaq(b.FAQ || "");
    setImagesUrl(b["images URL"] || "");
    setImage3(b["image 3"] || "");
    setArticleCategory(b["Article Category"] || "");
    setSteps(b.STEPS);
    setNeedsApproval(b["Needs Approval?"] || false);
  }, []);

  // Handle polling updates - update ALL fields
  const handlePollingUpdate = useCallback((newBlog: Blog, prevStep: BlogStatus | null, changedFields: string[]) => {
    // Map steps to their corresponding fields for validation
    const stepToFieldMap: Record<string, { field: keyof Blog; label: string }> = {
      "Title": { field: "TITLE", label: "Title" },
      "Permalink": { field: "Permalink", label: "Permalink" },
      "Meta Description": { field: "META DESC", label: "Meta Description" },
      "Introduction": { field: "INTRODUCTION", label: "Introduction" },
      "TOC": { field: "TOC", label: "Table of Contents" },
      "TL;DR": { field: "TL;DR", label: "TL;DR" },
      "Conclusion": { field: "CONCLUSION", label: "Conclusion" },
    };

    const fieldLabels: Record<string, string> = {
      "TITLE": "Title",
      "Permalink": "Permalink",
      "META DESC": "Meta Description",
      "INTRODUCTION": "Introduction",
      "CONCLUSION": "Conclusion",
      "TL;DR": "TL;DR",
      "Section 1": "Section 1",
      "Section 2": "Section 2",
      "Section 3": "Section 3",
      "Section 4": "Section 4",
      "Section 5": "Section 5",
      "Section 6": "Section 6",
      "Section 7": "Section 7",
      "FAQ": "FAQ",
      "images URL": "Image 1",
      "image 1": "Image 1",
      "image 3": "Image 3",
      "Article Category": "Category",
    };

    // Show toast when step changes
    if (prevStep && prevStep !== newBlog.STEPS) {
      toast.info(`Generation step: ${newBlog.STEPS}`, { duration: 2000 });

      // Check if the previous step's field was filled - if not, show warning
      const prevStepConfig = stepToFieldMap[prevStep];
      if (prevStepConfig) {
        const fieldValue = newBlog[prevStepConfig.field];
        if (!fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "")) {
          toast.warning(`${prevStepConfig.label} not set in form`, { duration: 3000 });
        }
      }
    }

    // Show toast for content field updates
    if (changedFields.length > 0) {
      const labels = changedFields.map(f => fieldLabels[f] || f).slice(0, 3);
      const moreCount = changedFields.length > 3 ? ` +${changedFields.length - 3} more` : "";
      toast.success(`Updated: ${labels.join(", ")}${moreCount}`, { duration: 2000 });
    }

    // Update ALL fields from polling
    updateFormFromBlog(newBlog);
  }, [updateFormFromBlog]);

  // Check if blog is finished (BODY is filled)
  const isBlogFinished = !!(blog?.BODY && blog.BODY.trim() !== "");

  // Real-time polling connection (polls every 3 seconds) - stops when blog is finished
  const { blog: polledBlog, isConnected, isGenerating, currentStep, error: streamError, refetch } = useBlogStream({
    blogId,
    enabled: !isNaN(blogId) && !isBlogFinished,
    pollingInterval: 3000,
    onUpdate: handlePollingUpdate,
  });

  // Refs for auto-save (must be before useEffects that use them)
  const prevImageUrlRef = useRef<string>("");
  const imageDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update blog state from polling (for BODY check and other metadata)
  useEffect(() => {
    if (polledBlog) {
      setBlog(polledBlog);
      if (isLoading) {
        // Initial load - update all fields and set initial image URL ref
        updateFormFromBlog(polledBlog);
        prevImageUrlRef.current = polledBlog["images URL"] || "";
        setIsLoading(false);
      }
    }
  }, [polledBlog, isLoading, updateFormFromBlog]);

  useEffect(() => {
    // Skip if loading or no blogId or same as previous
    if (isLoading || isNaN(blogId) || imagesUrl === prevImageUrlRef.current) {
      return;
    }

    // Clear previous debounce
    if (imageDebounceRef.current) {
      clearTimeout(imageDebounceRef.current);
    }

    // Debounce auto-save (wait 1 second after user stops typing)
    imageDebounceRef.current = setTimeout(async () => {
      if (!imagesUrl.trim()) return; // Don't save empty URLs

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "images URL": imagesUrl,
            "image 1": imagesUrl,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success("Image URL saved to Baserow", { duration: 2000 });
          prevImageUrlRef.current = imagesUrl;
        }
      } catch (err) {
        console.error("Failed to auto-save image URL:", err);
      }
    }, 1000);

    return () => {
      if (imageDebounceRef.current) {
        clearTimeout(imageDebounceRef.current);
      }
    };
  }, [imagesUrl, blogId, isLoading]);

  const handleSave = async (newStatus?: BlogStatus) => {
    setIsSaving(true);
    setError(null);

    const toastId = newStatus === "PUBLISH" ? "publish-blog" : "save-blog";
    toast.loading(newStatus === "PUBLISH" ? "Publishing..." : "Saving...", { id: toastId });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          TITLE: title,
          Permalink: permalink,
          "META DESC": metaDesc,
          INTRODUCTION: introduction,
          CONCLUSION: conclusion,
          "TL;DR": tldr,
          "Section 1": section1,
          "Section 2": section2,
          "Section 3": section3,
          "Section 4": section4,
          "Section 5": section5,
          "Section 6": section6,
          "Section 7": section7,
          FAQ: faq,
          "images URL": imagesUrl,
          "image 1": imagesUrl,
          "image 3": image3,
          STEPS: newStatus || steps,
          "Needs Approval?": needsApproval,
          "Article Category": articleCategory,
        }),
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
      } else {
        toast.error(data.error || "Failed to save blog", { id: toastId });
        setError(data.error || "Failed to save blog");
      }
    } catch (err) {
      toast.error("Failed to save blog", { id: toastId });
      setError("Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = (USER_EDITABLE_STATUSES as readonly string[]).includes(steps);

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
              Keyword: {blog?.Keywords} | Project: {blog?.Project}
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
          <StatusBadge status={blog?.STEPS || "PARKING"} />
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          {blog?.STEPS !== "COMPLETED" && (
            <Button
              onClick={() => handleSave("PUBLISH")}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Blog finished badge - shows when BODY is filled */}
      {blog?.BODY && blog.BODY.trim() !== "" && (
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Permalink */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permalink">Permalink</Label>
                <Input
                  id="permalink"
                  value={permalink}
                  onChange={(e) => setPermalink(e.target.value)}
                  placeholder="page-permalink"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta Description</Label>
                <Textarea
                  id="metaDesc"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="SEO meta description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDesc.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* TL;DR & Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>TL;DR</Label>
                <BlogEditor content={tldr} onChange={setTldr} placeholder="Brief summary..." />
              </div>

              <div className="space-y-2">
                <Label>Introduction</Label>
                <BlogEditor content={introduction} onChange={setIntroduction} placeholder="Introduction content..." />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Content Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionEditor title="Section 1" content={section1} onChange={setSection1} defaultOpen />
              <SectionEditor title="Section 2" content={section2} onChange={setSection2} />
              <SectionEditor title="Section 3" content={section3} onChange={setSection3} />
              <SectionEditor title="Section 4" content={section4} onChange={setSection4} />
              <SectionEditor title="Section 5" content={section5} onChange={setSection5} />
              <SectionEditor title="Section 6" content={section6} onChange={setSection6} />
              <SectionEditor title="Section 7" content={section7} onChange={setSection7} />
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogEditor content={faq} onChange={setFaq} placeholder="Frequently asked questions..." />
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card>
            <CardHeader>
              <CardTitle>Conclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogEditor content={conclusion} onChange={setConclusion} placeholder="Conclusion content..." />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status (STEPS)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={steps}
                onChange={(e) => setSteps(e.target.value as BlogStatus)}
                disabled={!canEdit}
              >
                {BLOG_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Setting STEPS to &quot;PUBLISH&quot; will trigger n8n to publish to WordPress.
              </p>
            </CardContent>
          </Card>

          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle>Article Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="articleCategory">Article Category</Label>
                <Input
                  id="articleCategory"
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  placeholder="e.g., Technology, Business"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsApproval"
                  checked={needsApproval}
                  onChange={(e) => setNeedsApproval(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="needsApproval" className="cursor-pointer">
                  Needs Approval?
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imagesUrl">Image 1 URL</Label>
                <Input
                  id="imagesUrl"
                  value={imagesUrl}
                  onChange={(e) => setImagesUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {imagesUrl && (
                <img
                  src={imagesUrl}
                  alt="Image 1"
                  className="w-full h-auto rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="space-y-2">
                <Label htmlFor="image3">Image 3 URL</Label>
                <Input
                  id="image3"
                  value={image3}
                  onChange={(e) => setImage3(e.target.value)}
                  placeholder="https://example.com/image3.jpg"
                />
              </div>
              {image3 && (
                <img
                  src={image3}
                  alt="Image 3"
                  className="w-full h-auto rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Read-only Info */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keyword:</span>
                <span className="font-medium">{blog?.Keywords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-medium">{blog?.Project}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">{blog?.Language}</span>
              </div>
              {blog?.Language_Code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language Code:</span>
                  <span className="font-medium">{blog.Language_Code}</span>
                </div>
              )}
              {blog?.Country_Code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country Code:</span>
                  <span className="font-medium">{blog.Country_Code}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
