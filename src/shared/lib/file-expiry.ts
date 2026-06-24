export type ExpiryBadge = {
  text: string;
  variant: "secondary" | "destructive" | "outline";
};

/**
 * Human expiry badge for a file's expires_at. Granular (seconds → minutes →
 * hours → days), so a 20-second TTL shows "20 soniya qoldi" and not "1 kun".
 * null expires_at = permanent.
 */
export function fileExpiryLabel(expiresAt?: string | null): ExpiryBadge {
  if (!expiresAt) return { text: "Doimiy", variant: "secondary" };

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(diff)) return { text: "Doimiy", variant: "secondary" };
  if (diff <= 0) return { text: "Muddati o'tgan", variant: "destructive" };

  const sec = Math.floor(diff / 1000);
  if (sec < 60) return { text: `${sec} soniya qoldi`, variant: "destructive" };
  const min = Math.floor(sec / 60);
  if (min < 60) return { text: `${min} daqiqa qoldi`, variant: "destructive" };
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return { text: `${hrs} soat qoldi`, variant: "destructive" };
  const days = Math.floor(hrs / 24);
  if (days <= 3) return { text: `${days} kun qoldi`, variant: "destructive" };

  const d = new Date(expiresAt);
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return { text: `${ymd} gacha`, variant: "outline" };
}
