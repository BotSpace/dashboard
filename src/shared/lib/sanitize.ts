import "server-only";
import sanitizeHtml from "sanitize-html";

// Server-side HTML sanitizer for rich text coming from the API (template
// descriptions etc.). Strips <script>, on*-handlers, javascript:/data: URIs,
// <iframe> and anything not on the allowlist — prevents stored XSS.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "b", "strong", "i", "em", "u", "s", "blockquote", "code", "pre",
    "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6", "span", "div",
    "img", "table", "thead", "tbody", "tr", "td", "th", "hr",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    span: ["class"],
    div: ["class"],
    code: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
