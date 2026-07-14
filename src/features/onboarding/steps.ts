// Onboarding tour step definitions. Each step points at a `data-tour="<target>"`
// anchor rendered elsewhere in the app shell. Copy lives in the i18n
// `onboarding.steps.<key>` namespace, not here.

export type TourPlacement = "top" | "bottom" | "left" | "right";

export type TourStep = {
  /** i18n key under `onboarding.steps` (title/body). */
  key: string;
  /** `data-tour` attribute value to spotlight. Absent → centered card. */
  target?: string;
  /** App-relative route (no locale) to navigate to before showing this step. */
  navigateTo?: string;
  /** When set, its i18n `onboarding.example` text pre-fills the agent composer. */
  prefillAgent?: boolean;
  /** Preferred tooltip side relative to the target. */
  placement?: TourPlacement;
  /** Extra px around the spotlight cutout. */
  pad?: number;
};

// Every anchor except the last lives in the persistent app shell (sidebar +
// floating button), so steps 1–4 work from any page without navigation. The
// final step lands the user on the AI agent with a ready-to-send example.
export const TOUR_STEPS: TourStep[] = [
  { key: "agent", target: "nav-agent", placement: "right", pad: 6 },
  { key: "bots", target: "nav-bots", placement: "right", pad: 6 },
  { key: "templates", target: "nav-templates", placement: "right", pad: 6 },
  { key: "fab", target: "agent-fab", placement: "top", pad: 12 },
  {
    key: "write",
    target: "agent-input",
    navigateTo: "/app/agent",
    prefillAgent: true,
    placement: "top",
    pad: 8,
  },
];
