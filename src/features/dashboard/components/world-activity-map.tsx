import { LIVE_DOTS } from "./mock-data";
import { cn } from "@/shared/lib/utils";

const dotSizes = {
  sm: { outer: "h-2.5 w-2.5", inner: "h-1.5 w-1.5", ping: "h-2.5 w-2.5" },
  md: { outer: "h-3.5 w-3.5", inner: "h-2 w-2", ping: "h-3.5 w-3.5" },
  lg: { outer: "h-5 w-5", inner: "h-2.5 w-2.5", ping: "h-5 w-5" },
};

export function WorldActivityMap() {
  return (
    <div className="relative h-52 w-full overflow-hidden rounded-lg sm:h-60">
      {/* World map SVG silhouette — stylized dotted pattern */}
      <svg
        viewBox="0 0 900 450"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,0.07)" />
          </pattern>
          <clipPath id="world-clip">
            <path d="
              M 60 110 L 80 90 L 120 85 L 180 80 L 220 90 L 250 85 L 280 100 L 300 95 L 330 85 L 360 90
              L 380 80 L 410 75 L 430 80 L 450 70 L 480 75 L 510 68 L 540 72 L 570 65 L 600 70
              L 630 75 L 650 68 L 680 72 L 710 78 L 730 70 L 760 80 L 790 85 L 820 80 L 845 90
              L 845 170 L 820 180 L 800 175 L 780 185 L 760 175 L 730 185 L 700 195 L 670 185
              L 640 195 L 620 185 L 590 200 L 560 195 L 530 205 L 500 200 L 470 210 L 440 205
              L 410 215 L 380 210 L 350 220 L 320 215 L 290 225 L 260 220 L 230 215 L 200 225
              L 170 215 L 140 225 L 110 220 L 80 225 L 60 220 Z
              M 60 245 L 90 240 L 120 250 L 150 245 L 180 255 L 210 250 L 240 260 L 270 255
              L 300 265 L 330 260 L 360 270 L 390 265 L 420 270 L 450 265 L 480 275 L 510 270
              L 540 280 L 570 275 L 600 285 L 630 280 L 660 290 L 690 285 L 720 290 L 750 285
              L 780 290 L 810 285 L 840 290 L 840 360 L 800 370 L 760 365 L 720 375 L 680 370
              L 640 380 L 600 375 L 560 380 L 520 375 L 480 385 L 440 380 L 400 385 L 360 380
              L 320 375 L 280 385 L 240 375 L 200 370 L 160 375 L 120 365 L 80 370 L 60 360 Z
            " />
          </clipPath>
        </defs>

        {/* Background dots covering entire area */}
        <rect width="900" height="450" fill="url(#dot-grid)" />

        {/* Continent silhouettes — brighter dots */}
        <g clipPath="url(#world-clip)">
          <rect width="900" height="450" fill="url(#dot-grid)" opacity="4" />
          {/* Extra continent brightening */}
          <rect width="900" height="450" fill="rgba(139,92,246,0.04)" />
        </g>

        {/* Subtle continent outlines */}
        {/* North America */}
        <path
          d="M 80 100 Q 130 85 180 90 Q 220 88 250 100 Q 260 130 250 160 Q 240 190 220 200 Q 200 215 180 210 Q 150 205 130 220 Q 110 235 90 240 Q 75 230 70 210 Q 65 180 70 150 Q 72 120 80 100 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* South America */}
        <path
          d="M 200 260 Q 230 250 260 255 Q 285 260 290 285 Q 295 310 280 340 Q 265 365 250 375 Q 230 380 215 370 Q 200 355 198 330 Q 195 300 200 260 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Europe */}
        <path
          d="M 390 80 Q 430 72 460 78 Q 480 85 490 100 Q 492 115 480 125 Q 470 135 455 130 Q 440 125 420 135 Q 405 140 395 130 Q 385 115 390 80 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Africa */}
        <path
          d="M 400 160 Q 435 150 460 158 Q 480 165 490 190 Q 495 220 485 255 Q 472 285 455 305 Q 435 320 415 315 Q 395 305 388 280 Q 382 250 388 215 Q 392 185 400 160 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Asia (Central/South) */}
        <path
          d="M 510 80 Q 570 65 640 70 Q 700 75 740 90 Q 760 105 750 130 Q 740 155 710 165 Q 680 170 650 160 Q 615 150 590 165 Q 565 175 545 165 Q 525 155 515 135 Q 508 110 510 80 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* East Asia */}
        <path
          d="M 700 85 Q 750 75 800 82 Q 840 88 845 115 Q 845 140 820 155 Q 795 165 765 158 Q 735 148 720 130 Q 705 112 700 85 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Australia */}
        <path
          d="M 720 310 Q 760 300 800 308 Q 830 315 840 340 Q 845 362 825 375 Q 800 385 770 380 Q 740 372 728 352 Q 718 330 720 310 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Pulsing live dots */}
      {LIVE_DOTS.map((dot, i) => {
        const s = dotSizes[dot.size as keyof typeof dotSizes];
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: dot.top, left: dot.left }}
          >
            {/* Ping ring */}
            <span
              className={cn(
                "absolute inline-flex animate-ping rounded-full opacity-60",
                s.ping,
                i % 3 === 0 ? "bg-violet-500" : i % 3 === 1 ? "bg-blue-500" : "bg-fuchsia-500",
              )}
              style={{ animationDuration: `${1.5 + (i % 4) * 0.4}s`, animationDelay: `${i * 0.2}s` }}
            />
            {/* Solid center */}
            <span
              className={cn(
                "relative inline-flex rounded-full",
                s.inner,
                i % 3 === 0 ? "bg-violet-400" : i % 3 === 1 ? "bg-blue-400" : "bg-fuchsia-400",
              )}
            />
          </div>
        );
      })}

      {/* Gradient fade at edges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-card/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-card/60 via-transparent to-card/80" />
    </div>
  );
}
