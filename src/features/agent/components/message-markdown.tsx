"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib/utils";

type Props = {
  children: string;
  className?: string;
};

// Faqat xavfsiz href sxemalariga ruxsat — javascript:/data:/vbscript: kabi
// XSS vektorlarini bloklaymiz (markdown matni AI yoki foydalanuvchidan keladi).
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  // Bo'sh joy/control belgilarni olib tashlab sxemani tekshiramiz (obfuskatsiyaga qarshi).
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

export function MessageMarkdown({ children, className }: Props) {
  return (
    <div className={cn("text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5 whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
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
          ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          h1: ({ children }) => <h1 className="mt-4 mb-2 text-base font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-3 mb-1.5 text-sm font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2.5 mb-1 text-sm font-semibold">{children}</h3>,
          code: ({ className, children, ...props }) => {
            const isInline = !/language-/.test(className ?? "");
            if (isInline) {
              return (
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("block font-mono text-xs", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-md border bg-muted/30 p-3 text-xs">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 pl-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-border/50" />,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border">
              <table className="min-w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/40">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b px-3 py-1.5 text-left text-xs font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="border-b px-3 py-1.5 text-xs">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
