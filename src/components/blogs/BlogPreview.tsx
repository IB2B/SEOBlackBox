"use client";

import { useState, useMemo } from "react";
import NextImage from "next/image";
import { marked } from "marked";
import type { Blog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

interface BlogPreviewProps {
  blog: Blog;
}

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

export function BlogPreview({ blog }: BlogPreviewProps) {
  const [imageError, setImageError] = useState(false);

  // Parse all content sections with markdown
  const parsedContent = useMemo(() => ({
    tldr: parseMarkdown(blog["TL;DR"] || ""),
    introduction: parseMarkdown(blog.INTRODUCTION || ""),
    sections: [
      blog["Section 1"],
      blog["Section 2"],
      blog["Section 3"],
      blog["Section 4"],
      blog["Section 5"],
      blog["Section 6"],
      blog["Section 7"],
    ].filter(Boolean).map(parseMarkdown),
    faq: parseMarkdown(blog.FAQ || ""),
    conclusion: parseMarkdown(blog.CONCLUSION || ""),
    body: parseMarkdown(blog.BODY || ""),
  }), [blog]);

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <div className="bg-white dark:bg-card border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Preview</p>
          <p className="text-xs text-muted-foreground">
            This is how your blog post will appear on WordPress
          </p>
        </div>

        {/* Featured Image - at the top */}
        {(() => {
          const imageUrl = blog["images URL"] || blog["image 1"];
          return (
            <div className="w-full">
              {imageUrl && typeof imageUrl === "string" && !imageError ? (
                <div className="relative w-full h-[300px] md:h-[400px]">
                  <NextImage
                    src={imageUrl}
                    alt={blog.TITLE || "Featured image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full h-[200px] bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-full bg-muted-foreground/10">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {imageUrl && imageError ? "Image failed to load" : "No featured image"}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Content */}
        <article className="p-6 max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">
            {blog.TITLE || "Untitled Post"}
          </h1>

          {/* Meta */}
          {blog["META DESC"] && (
            <p className="text-lg text-muted-foreground mb-6 italic">
              {blog["META DESC"]}
            </p>
          )}

          {/* TL;DR */}
          {parsedContent.tldr && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">TL;DR</p>
              <div
                className="prose prose-sm max-w-none text-blue-900"
                dangerouslySetInnerHTML={{ __html: parsedContent.tldr }}
              />
            </div>
          )}

          {/* Introduction */}
          {parsedContent.introduction && (
            <div className="mb-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedContent.introduction }}
              />
            </div>
          )}

          {/* Sections */}
          {parsedContent.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section }}
              />
            </div>
          ))}

          {/* FAQ */}
          {parsedContent.faq && (
            <div className="mb-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedContent.faq }}
              />
            </div>
          )}

          {/* Conclusion */}
          {parsedContent.conclusion && (
            <div className="mb-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedContent.conclusion }}
              />
            </div>
          )}

          {/* Full BODY (if exists) */}
          {parsedContent.body && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">Full Body Content:</p>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedContent.body }}
              />
            </div>
          )}
        </article>

        {/* SEO Preview */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Search Engine Preview</p>
          <div className="bg-white p-4 rounded border">
            <p className="text-blue-600 text-lg hover:underline cursor-pointer">
              {blog.TITLE || "Page Title"}
            </p>
            <p className="text-green-700 text-sm">
              example.com/{blog.Permalink || "page-slug"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {blog["META DESC"] || "Page description will appear here..."}
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
