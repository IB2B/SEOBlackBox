import type { Blog } from "@/types";

/**
 * Compile BODY from individual blog sections.
 * This produces the full HTML content that n8n reads to publish to WordPress.
 * Sections are assembled in order, skipping empty ones.
 */
export function compileBlogBody(fields: {
  introduction?: string;
  tldr?: string;
  section1?: string;
  section2?: string;
  section3?: string;
  section4?: string;
  section5?: string;
  section6?: string;
  section7?: string;
  faq?: string;
  conclusion?: string;
}): string {
  const parts: string[] = [];

  if (fields.introduction?.trim()) parts.push(fields.introduction);
  if (fields.tldr?.trim()) parts.push(fields.tldr);

  // Add non-empty sections in order
  const sections = [
    fields.section1,
    fields.section2,
    fields.section3,
    fields.section4,
    fields.section5,
    fields.section6,
    fields.section7,
  ];
  for (const section of sections) {
    if (section?.trim()) parts.push(section);
  }

  if (fields.faq?.trim()) parts.push(fields.faq);
  if (fields.conclusion?.trim()) parts.push(fields.conclusion);

  return parts.join("\n\n");
}

/**
 * Extract section fields from a Blog object into the format expected by compileBlogBody.
 */
export function blogToBodyFields(blog: Partial<Blog>) {
  return {
    introduction: blog.INTRODUCTION || "",
    tldr: blog["TL;DR"] || "",
    section1: blog["Section 1"] || "",
    section2: blog["Section 2"] || "",
    section3: blog["Section 3"] || "",
    section4: blog["Section 4"] || "",
    section5: blog["Section 5"] || "",
    section6: blog["Section 6"] || "",
    section7: blog["Section 7"] || "",
    faq: blog.FAQ || "",
    conclusion: blog.CONCLUSION || "",
  };
}
