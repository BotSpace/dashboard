import { ImageResponse } from "next/og";

export const alt = "BotSpace — Telegram bot yaratish AI konstruktori";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social card shared by all public pages (overridden where a page
// supplies its own image, e.g. blog posts and template detail).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #11111b 45%, #1b1036 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>BotSpace</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            Telegram bot yarating — kod yozmasdan
          </div>
          <div style={{ fontSize: 34, color: "#a1a1aa", maxWidth: 900 }}>
            Vizual flow konstruktor · AI agent · CRM · to&apos;lovlar
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
          <span style={{ color: "#c4b5fd", fontWeight: 600 }}>botspace.uz</span>
          <span style={{ color: "#71717a" }}>Bepul boshlang</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
