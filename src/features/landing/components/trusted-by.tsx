"use client";

const companies = [
  "Uzum",
  "Payme",
  "Click",
  "Hamkorbank",
  "MyTaxi",
  "Humans",
  "Billz",
  "Aloqa",
];

// Duplicate list for seamless infinite marquee loop
const marqueeItems = [...companies, ...companies];

export function TrustedBy() {
  return (
    <section className="relative overflow-hidden py-16" style={{ background: "#06060a" }}>
      <div className="container-page mb-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20">
          Ishonchli hamkorlar
        </p>
      </div>

      {/* Fade edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{
          background: "linear-gradient(to right, #06060a, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{
          background: "linear-gradient(to left, #06060a, transparent)",
        }}
      />

      <div className="flex overflow-hidden">
        <div
          className="flex shrink-0 items-center gap-12 whitespace-nowrap"
          style={{
            animation: "trusted-marquee 20s linear infinite",
          }}
        >
          {marqueeItems.map((name, i) => (
            <div
              key={i}
              className="text-sm font-semibold tracking-wide text-white/20 transition-colors duration-300 hover:text-white/40 cursor-default px-2"
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes trusted-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
