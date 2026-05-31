// Static mock data — no Math.random, safe for SSR/hydration

export const PERF_DATA = [
  { day: "May 1", messages: 980000 },
  { day: "May 3", messages: 1200000 },
  { day: "May 5", messages: 1050000 },
  { day: "May 7", messages: 1480000 },
  { day: "May 9", messages: 1320000 },
  { day: "May 11", messages: 1700000 },
  { day: "May 13", messages: 1550000 },
  { day: "May 15", messages: 1900000 },
  { day: "May 17", messages: 1750000 },
  { day: "May 19", messages: 2100000 },
  { day: "May 21", messages: 1980000 },
  { day: "May 23", messages: 2300000 },
  { day: "May 25", messages: 2150000 },
  { day: "May 27", messages: 2500000 },
  { day: "May 29", messages: 2400000 },
];

export const TOP_BOTS = [
  { id: 1, name: "UzShop Assistant", initial: "UA", color: "violet", value: 125430, delta: "+18%" },
  { id: 2, name: "Delivery Tracker", initial: "DT", color: "blue", value: 98210, delta: "+12%" },
  { id: 3, name: "Support Bot", initial: "SB", color: "fuchsia", value: 74350, delta: "+9%" },
  { id: 4, name: "Quiz Master", initial: "QM", color: "emerald", value: 51200, delta: "+24%" },
  { id: 5, name: "News Bot", initial: "NB", color: "amber", value: 38940, delta: "+7%" },
];

export const MOCK_BOTS = [
  {
    id: "m1",
    name: "UzShop Assistant",
    username: "@uzshop_bot",
    status: "active" as const,
    updatedAt: "2 soat oldin",
    initial: "UA",
  },
  {
    id: "m2",
    name: "Delivery Tracker",
    username: "@delivery_bot",
    status: "active" as const,
    updatedAt: "5 soat oldin",
    initial: "DT",
  },
  {
    id: "m3",
    name: "Support Bot",
    username: "@support_bot",
    status: "inactive" as const,
    updatedAt: "1 kun oldin",
    initial: "SB",
  },
  {
    id: "m4",
    name: "Quiz Master",
    username: "@quiz_bot",
    status: "active" as const,
    updatedAt: "3 soat oldin",
    initial: "QM",
  },
  {
    id: "m5",
    name: "News Bot",
    username: "@news_bot",
    status: "active" as const,
    updatedAt: "6 soat oldin",
    initial: "NB",
  },
];

export const DONUT_DATA = [
  { name: "Foydalanuvchilar", value: 45, color: "#8b5cf6" },
  { name: "Guruhlar", value: 30, color: "#3b82f6" },
  { name: "Kanallar", value: 15, color: "#d946ef" },
  { name: "Boshqalar", value: 10, color: "#6b7280" },
];

export const LIVE_DOTS = [
  { top: "28%", left: "52%", size: "lg" },  // O'rta Osiyo
  { top: "35%", left: "20%", size: "md" },  // G'arbiy Yevropa
  { top: "42%", left: "75%", size: "sm" },  // Sharqiy Osiyo
  { top: "22%", left: "35%", size: "md" },  // Sharqiy Yevropa
  { top: "55%", left: "30%", size: "sm" },  // Afrika
  { top: "48%", left: "88%", size: "md" },  // Janubi-Sharqiy Osiyo
  { top: "38%", left: "58%", size: "lg" },  // Janubiy Osiyo
  { top: "65%", left: "45%", size: "sm" },  // Janubiy Amerika
  { top: "30%", left: "12%", size: "sm" },  // Shimoliy Amerika
];
