"use client";

import { KeywordForm } from "@/components/blogs/KeywordForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Blog</h1>
        <p className="text-muted-foreground">
          Create a new blog post from a keyword. Select a project and configure
          the language settings for your content.
        </p>
      </div>

      <KeywordForm />
    </div>
  );
}
