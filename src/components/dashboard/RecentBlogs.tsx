"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import type { Blog } from "@/types";
import { ROUTES } from "@/lib/constants";
import { truncate } from "@/lib/utils";
import { ArrowRight, FileText } from "lucide-react";

interface RecentBlogsProps {
  blogs: Blog[];
  isLoading: boolean;
}

export function RecentBlogs({ blogs, isLoading }: RecentBlogsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Blogs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Blogs</CardTitle>
        <Link href={ROUTES.BLOGS}>
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {blogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No blogs yet. Start by adding a keyword.
            </p>
            <Link href={ROUTES.BLOG_NEW}>
              <Button className="mt-4">Add Blog</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={ROUTES.BLOG_EDIT(blog.id)}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {blog.TITLE || blog.Keywords}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {truncate(blog.Keywords, 40)} | {blog.Project}
                  </p>
                </div>
                <StatusBadge status={blog.STEPS} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
