// Logout — ROUTE HANDLER (server action emas). Server action cookies().set()/delete()
// ni brauzerga qo'llamasdi → logout cookie'ni o'chirmasdi (foydalanuvchi kirgan
// holatda qolardi). Route handler bir nechta Set-Cookie (host-only + domain) bilan
// bm_session'ni ishonchli o'chiradi va relativ redirect qiladi.
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/shared/lib/env";

export async function GET(req: NextRequest) {
  const locale = (req.nextUrl.searchParams.get("locale") || "uz").trim() || "uz";

  // Relativ Location — gateway orqasida origin taxmin qilish shart emas.
  const res = new NextResponse(null, { status: 307, headers: { Location: `/${locale}/login` } });

  const name = env.SESSION_COOKIE_NAME;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const base = `=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;

  // Cookie qaysi scope'da o'rnatilgan bo'lsa ham o'chsin: host-only + domain-scoped.
  res.headers.append("Set-Cookie", `${name}${base}`);
  if (env.SESSION_COOKIE_DOMAIN) {
    res.headers.append("Set-Cookie", `${name}${base}; Domain=${env.SESSION_COOKIE_DOMAIN}`);
  }

  return res;
}
