import Link from "next/link";
import Image from "next/image";

// Global 404. This sits above the [locale] segment, so next-intl messages
// aren't available here — we use the default-locale (Uzbek) copy directly.
export default function NotFound() {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          background: "#06060b",
          color: "#fff",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Image
          src="/logo-dark.png"
          alt="BotSpace"
          width={200}
          height={50}
          style={{ height: "auto", width: "160px" }}
          priority
        />
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, #fff 30%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          404
        </div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
          Sahifa topilmadi
        </h1>
        <p style={{ margin: 0, maxWidth: "28rem", color: "#c5cad3", lineHeight: 1.6 }}>
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan. Bosh
          sahifaga qaytib, qaytadan urinib ko&apos;ring.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "9999px",
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            background: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
            boxShadow: "0 10px 30px -10px rgba(139,92,246,0.6)",
          }}
        >
          Bosh sahifaga qaytish
        </Link>
      </body>
    </html>
  );
}
