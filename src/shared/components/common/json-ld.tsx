type JsonLdData = Record<string, unknown>;

/**
 * Renders a JSON-LD <script> for structured data (rich results in Google).
 * Server component — output is inlined into the HTML.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify already escapes quotes; also escape `<` so the payload
      // can never break out of the <script> tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
