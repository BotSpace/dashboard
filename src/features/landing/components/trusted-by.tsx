"use client";

const companies = ["Uzum", "Payme", "Click", "Hamkorbank", "MyTaxi", "Humans", "Billz", "Aloqa"];

export function TrustedBy() {
  return (
    <section className="relative py-16" style={{ background: "#06060a" }}>
      <div className="container-page">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20">
          Ishonchli hamkorlar
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((name) => (
            <div
              key={name}
              className="text-sm font-semibold tracking-wide text-white/15 transition-colors hover:text-white/30"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
