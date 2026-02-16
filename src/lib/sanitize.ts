import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with safe defaults
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return "";

  // DOMPurify configuration for safe HTML
  const config = {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id",
      "target", "rel", "width", "height",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"], // Allow target attribute for links
    FORBID_TAGS: ["script", "style", "iframe", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  };

  // Sanitize and return
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize and create props for dangerouslySetInnerHTML
 */
export function createSafeHtml(content: string | undefined | null): { __html: string } {
  return { __html: sanitizeHtml(content) };
}
