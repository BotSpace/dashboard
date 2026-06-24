import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronLeft, ChevronRight, Layers, Plus } from "lucide-react";
import { CreateBotForm } from "@/features/bots/components/create-form";
import { Link } from "@/shared/i18n/routing";

export default async function NewBotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.create");
  const tBots = await getTranslations("bots");

  return (
    <div style={{ padding: "28px 32px", maxWidth: 760 }}>
      {/* Back button */}
      <Link
        href="/app/bots"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors"
        style={{ textDecoration: "none" }}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{tBots("title")}</span>
      </Link>

      {/* Page heading */}
      <h1
        className="text-[27px] font-semibold tracking-[-0.6px] mb-1.5"
        style={{ fontFamily: "Space Grotesk" }}
      >
        {t("title")}
      </h1>
      <p className="text-sm text-[#8a8a93] mb-6">
        Noldan boshlang yoki tayyor shablondan foydalaning
      </p>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-[14px] mb-[26px]">
        {/* Blank */}
        <div className="rounded-[13px] border border-blue-500/40 bg-white/[0.025] p-5 text-left cursor-pointer hover:border-blue-500/60 transition-colors">
          <span className="mb-[14px] flex h-11 w-11 items-center justify-center rounded-[11px] bg-blue-500/10 text-blue-400">
            <Plus className="h-5 w-5" />
          </span>
          <div
            className="text-[15px] font-semibold mb-1"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {t("blank")}
          </div>
          <p className="m-0 text-[12.5px] text-[#8a8a93] leading-[1.5]">
            {t("blankDesc")}
          </p>
        </div>

        {/* Template */}
        <div className="rounded-[13px] border border-border/60 bg-white/[0.025] p-5 text-left cursor-pointer hover:border-emerald-500/40 transition-colors">
          <span className="mb-[14px] flex h-11 w-11 items-center justify-center rounded-[11px] bg-emerald-500/10 text-emerald-400">
            <Layers className="h-5 w-5" />
          </span>
          <div
            className="text-[15px] font-semibold mb-1"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {t("fromTemplate")}
          </div>
          <p className="m-0 text-[12.5px] text-[#8a8a93] leading-[1.5]">
            {t("fromTemplateDesc")}
          </p>
        </div>
      </div>

      {/* Template marketplace hint */}
      <div className="flex items-center gap-2 mb-6 px-[14px] py-3 rounded-[10px] bg-blue-500/[0.06] border border-blue-500/[0.16]">
        <Layers className="h-4 w-4 shrink-0 text-blue-300" />
        <span className="text-[13px] text-zinc-400">Tayyor yechimlar uchun</span>
        <Link
          href="/app/templates"
          className="flex items-center gap-1 text-[13px] font-semibold text-blue-400 hover:text-blue-300 transition-colors ml-0.5"
          style={{ textDecoration: "none" }}
        >
          Shablonlar marketplace
          <ChevronRight className="h-[14px] w-[14px]" />
        </Link>
      </div>

      {/* Form card */}
      <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-6">
        <CreateBotForm />
      </div>
    </div>
  );
}
