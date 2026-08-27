import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Used when rendering dynamic content with dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", 
      "h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "img", "blockquote", "pre", "code"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "target"],
    ADD_ATTR: ["target"],
  });
}
