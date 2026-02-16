"use client";

import { useState, useMemo, useEffect } from "react";
import { marked } from "marked";
import type { Blog, BlogStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "./BlogEditor";
import { Edit2, X, Save, Send, Loader2, ImageIcon, Link2, Type, FileText } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

// Configure marked for better list and formatting support
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Pre-process content to fix common markdown issues
function preprocessMarkdown(content: string): string {
  if (!content) return "";

  let processed = content;

  // Fix inline list items: convert " - " to proper newlines for lists
  // Match patterns like "text. - **Item**" or "text: - Item"
  processed = processed.replace(/([.!?:])(\s*)- \*\*/g, "$1\n\n- **");
  processed = processed.replace(/([.!?:])(\s*)- ([A-Z])/g, "$1\n\n- $3");

  // Fix lists that start with " - " inline after any text
  processed = processed.replace(/(\S)\s+- \*\*/g, "$1\n\n- **");
  processed = processed.replace(/(\S)\s+- ([A-Z])/g, "$1\n\n- $2");

  // Ensure proper spacing around headers
  processed = processed.replace(/([^\n])(\n#{1,6}\s)/g, "$1\n$2");

  // Fix multiple consecutive list items that might be on the same line
  processed = processed.replace(/\*\*\s*-\s+\*\*/g, "**\n\n- **");

  return processed;
}

interface BlogPreviewEditableProps {
  blog: Blog;
  onSave: (updatedBlog: Partial<Blog>, newStatus?: BlogStatus) => Promise<void>;
  isSaving: boolean;
}

type EditableSection =
  | "tldr"
  | "introduction"
  | "section1"
  | "section2"
  | "section3"
  | "section4"
  | "section5"
  | "section6"
  | "section7"
  | "faq"
  | "conclusion"
  | "body"
  | "image"
  | "title"
  | "metaDesc"
  | "permalink"
  | null;

// Parse markdown to HTML with sanitization
function parseMarkdown(content: string): string {
  if (!content) return "";
  // Pre-process to fix formatting issues, then convert markdown to HTML
  const processed = preprocessMarkdown(content);
  const html = marked.parse(processed, { async: false }) as string;
  // Sanitize to prevent XSS attacks
  return sanitizeHtml(html);
}

// Get proxied image URL for external images
function getImageUrl(url: string): string {
  if (!url) return "";
  // Use proxy for external URLs to avoid CORS/expiration issues
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function BlogPreviewEditable({ blog, onSave, isSaving }: BlogPreviewEditableProps) {
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [editContent, setEditContent] = useState("");
  const [imageError, setImageError] = useState(false);
  const [lastImageUrl, setLastImageUrl] = useState("");

  // Local state for all editable content
  const [content, setContent] = useState({
    tldr: blog["TL;DR"] || "",
    introduction: blog.INTRODUCTION || "",
    section1: blog["Section 1"] || "",
    section2: blog["Section 2"] || "",
    section3: blog["Section 3"] || "",
    section4: blog["Section 4"] || "",
    section5: blog["Section 5"] || "",
    section6: blog["Section 6"] || "",
    section7: blog["Section 7"] || "",
    faq: blog.FAQ || "",
    conclusion: blog.CONCLUSION || "",
    body: blog.BODY || "",
    // New editable fields - check both "images URL" and "image 1" fields
    imageUrl: blog["images URL"] || blog["image 1"] || "",
    title: blog.TITLE || "",
    metaDesc: blog["META DESC"] || "",
    permalink: blog.Permalink || "",
  });

  // Reset image error when URL changes
  useEffect(() => {
    if (content.imageUrl !== lastImageUrl) {
      setImageError(false);
      setLastImageUrl(content.imageUrl);
    }
  }, [content.imageUrl, lastImageUrl]);

  // Parse content for display
  const parsedContent = useMemo(() => ({
    tldr: parseMarkdown(content.tldr),
    introduction: parseMarkdown(content.introduction),
    sections: [
      content.section1,
      content.section2,
      content.section3,
      content.section4,
      content.section5,
      content.section6,
      content.section7,
    ].filter(Boolean).map(parseMarkdown),
    faq: parseMarkdown(content.faq),
    conclusion: parseMarkdown(content.conclusion),
    body: parseMarkdown(content.body),
  }), [content]);

  const startEditing = (section: EditableSection, currentContent: string) => {
    setEditingSection(section);
    setEditContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent("");
  };

  const saveSection = () => {
    if (!editingSection) return;

    setContent(prev => ({
      ...prev,
      [editingSection]: editContent,
    }));
    setEditingSection(null);
    setEditContent("");
  };

  const handleSaveAll = async (newStatus?: BlogStatus) => {
    await onSave({
      "TL;DR": content.tldr,
      INTRODUCTION: content.introduction,
      "Section 1": content.section1,
      "Section 2": content.section2,
      "Section 3": content.section3,
      "Section 4": content.section4,
      "Section 5": content.section5,
      "Section 6": content.section6,
      "Section 7": content.section7,
      FAQ: content.faq,
      CONCLUSION: content.conclusion,
      BODY: content.body,
      // New fields
      "images URL": content.imageUrl,
      TITLE: content.title,
      "META DESC": content.metaDesc,
      Permalink: content.permalink,
    }, newStatus);
  };

  const renderEditableSection = (
    sectionKey: EditableSection,
    sectionContent: string,
    parsedHtml: string,
    label?: string
  ) => {
    const isEditing = editingSection === sectionKey;

    if (isEditing) {
      return (
        <div className="mb-8">
          {label && <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>}
          <div className="border-2 border-primary rounded-lg">
            <BlogEditor
              content={editContent}
              onChange={setEditContent}
              placeholder={`Enter ${label?.toLowerCase() || 'content'}...`}
            />
            <div className="flex justify-end gap-2 p-2 bg-muted/50 border-t">
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveSection}>
                <Save className="w-4 h-4 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (!parsedHtml) return null;

    return (
      <div className="mb-8 group relative">
        {label && <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>}
        <div
          className="prose prose-sm max-w-none cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
          onClick={() => startEditing(sectionKey, sectionContent)}
        />
        <button
          onClick={() => startEditing(sectionKey, sectionContent)}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-primary-foreground rounded"
          title="Edit section"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Get non-empty sections with their indices
  const sectionsData = [
    { key: "section1" as const, content: content.section1 },
    { key: "section2" as const, content: content.section2 },
    { key: "section3" as const, content: content.section3 },
    { key: "section4" as const, content: content.section4 },
    { key: "section5" as const, content: content.section5 },
    { key: "section6" as const, content: content.section6 },
    { key: "section7" as const, content: content.section7 },
  ].filter(s => s.content);

  return (
    <div className="space-y-6">
      {/* Save Buttons */}
      <div className="flex justify-end gap-2 sticky top-0 z-10 bg-background py-2">
        <Button
          variant="outline"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
        {blog.STEPS !== "COMPLETED" && (
          <Button
            onClick={() => handleSaveAll("PUBLISH")}
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

      {/* Preview Card */}
      <div className="bg-white dark:bg-card border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Preview & Edit</p>
          <p className="text-xs text-muted-foreground">
            Click on any section to edit it inline
          </p>
        </div>

        {/* Featured Image - at the top */}
        <div className="w-full group relative">
          {editingSection === "image" ? (
            <div className="p-4 bg-muted/30 border-b">
              <p className="text-sm font-medium mb-2">Featured Image URL</p>
              <div className="flex gap-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter image URL (https://...)"
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => {
                  setContent(prev => ({ ...prev, imageUrl: editContent }));
                  setImageError(false);
                  setEditingSection(null);
                  setEditContent("");
                }}>
                  <Save className="w-4 h-4 mr-1" />
                  Apply
                </Button>
              </div>
              {editContent && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img
                    src={editContent}
                    alt="Preview"
                    className="max-h-[200px] rounded-lg object-cover"
                    onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                  />
                </div>
              )}
            </div>
          ) : content.imageUrl && !imageError ? (
            <>
              <img
                key={content.imageUrl}
                src={content.imageUrl}
                alt={content.title || "Featured image"}
                className="w-full h-auto max-h-[400px] object-cover cursor-pointer"
                onError={() => setImageError(true)}
                onClick={() => startEditing("image", content.imageUrl)}
              />
              <button
                onClick={() => startEditing("image", content.imageUrl)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/50 text-white rounded-lg hover:bg-black/70"
                title="Edit image"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div
              className="w-full h-[200px] bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => startEditing("image", content.imageUrl)}
            >
              <div className="p-4 rounded-full bg-muted-foreground/10">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {content.imageUrl && imageError ? "Image failed to load" : "No featured image"}
              </p>
              <p className="text-xs text-muted-foreground">Click to {content.imageUrl ? "edit" : "add"} image URL</p>
              {content.imageUrl && imageError && (
                <p className="text-xs text-red-400 max-w-md truncate px-4">
                  URL: {content.imageUrl.substring(0, 50)}...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <article className="p-6 max-w-3xl mx-auto">
          {/* Editable Title */}
          {editingSection === "title" ? (
            <div className="mb-4">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter blog title..."
                className="text-3xl font-bold h-auto py-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  setContent(prev => ({ ...prev, title: editContent }));
                  setEditingSection(null);
                  setEditContent("");
                }}>
                  <Save className="w-4 h-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative mb-4">
              <h1
                className="text-3xl font-bold cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => startEditing("title", content.title)}
              >
                {content.title || "Untitled Post"}
              </h1>
              <button
                onClick={() => startEditing("title", content.title)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-primary-foreground rounded"
                title="Edit title"
              >
                <Type className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Editable Meta Description */}
          {editingSection === "metaDesc" ? (
            <div className="mb-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter meta description..."
                className="w-full text-lg text-muted-foreground italic border rounded-lg p-3 min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  setContent(prev => ({ ...prev, metaDesc: editContent }));
                  setEditingSection(null);
                  setEditContent("");
                }}>
                  <Save className="w-4 h-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative mb-6">
              <p
                className="text-lg text-muted-foreground italic cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => startEditing("metaDesc", content.metaDesc)}
              >
                {content.metaDesc || "Click to add meta description..."}
              </p>
              <button
                onClick={() => startEditing("metaDesc", content.metaDesc)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-primary-foreground rounded"
                title="Edit meta description"
              >
                <FileText className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* TL;DR */}
          {(content.tldr || editingSection === "tldr") && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">TL;DR</p>
              {editingSection === "tldr" ? (
                <div className="border-2 border-primary rounded-lg bg-white">
                  <BlogEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="Enter TL;DR..."
                  />
                  <div className="flex justify-end gap-2 p-2 bg-muted/50 border-t">
                    <Button variant="ghost" size="sm" onClick={cancelEditing}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveSection}>
                      <Save className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-blue-900 cursor-pointer hover:bg-blue-100/50 rounded p-1 -m-1 transition-colors group relative"
                  dangerouslySetInnerHTML={{ __html: parsedContent.tldr }}
                  onClick={() => startEditing("tldr", content.tldr)}
                />
              )}
            </div>
          )}

          {/* Introduction */}
          {renderEditableSection("introduction", content.introduction, parsedContent.introduction)}

          {/* Sections */}
          {sectionsData.map((section, index) => (
            renderEditableSection(
              section.key,
              section.content,
              parseMarkdown(section.content),
              `Section ${index + 1}`
            )
          ))}

          {/* FAQ */}
          {renderEditableSection("faq", content.faq, parsedContent.faq)}

          {/* Conclusion */}
          {renderEditableSection("conclusion", content.conclusion, parsedContent.conclusion)}

          {/* Full BODY */}
          {(content.body || editingSection === "body") && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">Full Body Content:</p>
              {renderEditableSection("body", content.body, parsedContent.body)}
            </div>
          )}
        </article>

        {/* SEO Preview */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Search Engine Preview</p>
          <div className="bg-white dark:bg-card p-4 rounded border">
            <p className="text-blue-600 text-lg hover:underline cursor-pointer">
              {content.title || "Page Title"}
            </p>
            {editingSection === "permalink" ? (
              <div className="flex items-center gap-2 my-1">
                <span className="text-green-700 text-sm">example.com/</span>
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                  placeholder="page-slug"
                  className="h-7 text-sm flex-1 max-w-[200px]"
                />
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={cancelEditing}>
                  <X className="w-3 h-3" />
                </Button>
                <Button size="sm" className="h-7 px-2" onClick={() => {
                  setContent(prev => ({ ...prev, permalink: editContent }));
                  setEditingSection(null);
                  setEditContent("");
                }}>
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="group relative inline-flex items-center gap-1">
                <p
                  className="text-green-700 text-sm cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 rounded px-1 -mx-1 transition-colors"
                  onClick={() => startEditing("permalink", content.permalink)}
                >
                  example.com/{content.permalink || "page-slug"}
                </p>
                <button
                  onClick={() => startEditing("permalink", content.permalink)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-green-600 text-white rounded"
                  title="Edit permalink"
                >
                  <Link2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              {content.metaDesc || "Page description will appear here..."}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Keyword</p>
              <p className="font-medium">{blog.Keywords}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Project</p>
              <p className="font-medium">{blog.Project}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{blog.STEPS}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Language</p>
              <p className="font-medium">{blog.Language} ({blog.Language_Code})</p>
            </div>
          </div>

          {/* Secondary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-border/50">
            <div>
              <p className="text-muted-foreground">Country</p>
              <p className="font-medium uppercase">{blog.Country_Code || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">TOC Sections</p>
              <p className="font-medium">{blog.NTOC || "-"}</p>
            </div>
            {blog["Article Category"] && (
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{blog["Article Category"]}</p>
              </div>
            )}
            {blog.Location && (
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{blog.Location}</p>
              </div>
            )}
          </div>

          {/* Niche & Cluster */}
          {(blog.Niche?.length > 0 || blog["KW CLUSTER"]) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t border-border/50">
              {blog.Niche?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Niche</p>
                  <div className="flex flex-wrap gap-1">
                    {blog.Niche.map((niche, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded text-xs">
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {blog["KW CLUSTER"] && (
                <div>
                  <p className="text-muted-foreground mb-2">Keyword Cluster</p>
                  <p className="font-medium text-xs bg-muted p-2 rounded max-h-20 overflow-auto">
                    {blog["KW CLUSTER"]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TOC Preview */}
          {blog.TOC && (
            <div className="text-sm pt-4 border-t border-border/50">
              <p className="text-muted-foreground mb-2">Table of Contents</p>
              <div className="bg-muted/50 p-3 rounded-lg text-xs max-h-32 overflow-auto whitespace-pre-wrap">
                {blog.TOC}
              </div>
            </div>
          )}

          {/* Meta & IDs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-border/50">
            {blog.Blog_ID && (
              <div>
                <p className="text-muted-foreground">Blog ID</p>
                <p className="font-mono text-xs">{blog.Blog_ID}</p>
              </div>
            )}
            {blog.Created_At && (
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(blog.Created_At).toLocaleDateString()}</p>
              </div>
            )}
            {blog["Needs Approval?"] && (
              <div>
                <p className="text-muted-foreground">Approval</p>
                <p className="font-medium text-orange-600">Needs Approval</p>
              </div>
            )}
            {blog["Business Hook?"] && (
              <div>
                <p className="text-muted-foreground">Business Hook</p>
                <p className="font-medium text-green-600">Yes</p>
              </div>
            )}
          </div>

          {/* Schema Markup */}
          {blog["Schema Markup"] && (
            <div className="text-sm pt-4 border-t border-border/50">
              <p className="text-muted-foreground mb-2">Schema Markup</p>
              <pre className="bg-muted/50 p-3 rounded-lg text-xs max-h-32 overflow-auto">
                {blog["Schema Markup"]}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
