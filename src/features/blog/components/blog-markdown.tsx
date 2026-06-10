"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib/utils";

type Props = {
  children: string;
  className?: string;
};

// Faqat xavfsiz href sxemalariga ruxsat — javascript:/data:/vbscript: kabi
// XSS vektorlarini bloklaymiz. Raw HTML render qilinmaydi (rehype-raw yo'q).
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const scheme = href
    .split("")
    .filter((ch) => ch.charCodeAt(0) > 32)
    .join("")
    .toLowerCase();
  if (scheme.startsWith("javascript:") || scheme.startsWith("data:") || scheme.startsWith("vbscript:")) {
    return undefined;
  }
  return href;
}

/**
 * Blog postlarini xavfsiz render qiluvchi Markdown komponenti.
 * `MessageMarkdown`'dan moslashtirilgan, lekin maqola uchun kattaroq tipografiya.
 */
export function BlogMarkdown({ children, className }: Props) {
  return (
    <div
      className={cn(
        "text-base leading-relaxed text-white/80 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-4">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={safeHref(href)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 text-2xl font-bold text-white md:text-3xl">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-7 mb-3 text-xl font-semibold text-white md:text-2xl">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold text-white">{children}</h3>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !/language-/.test(className ?? "");
            if (isInline) {
              return (
                <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("block font-mono text-sm", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-xl bg-black/40 p-4 text-sm">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-2 border-primary/40 pl-4 text-white/60 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-white/10" />,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-white/10 px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-white/10 px-3 py-2">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
