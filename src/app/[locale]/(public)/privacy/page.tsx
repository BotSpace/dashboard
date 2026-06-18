import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati — BotSpace",
  description: "BotSpace qanday ma'lumotlarni yig'adi, ishlatadi va himoya qiladi.",
};

const UPDATED = "2026-yil 18-iyun";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/70">{children}</div>
    </section>
  );
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Maxfiylik siyosati</h1>
        <p className="text-sm text-white/50">Oxirgi yangilanish: {UPDATED}</p>
      </header>

      <div className="space-y-10">
        <Section title="1. Kirish">
          <p>
            Ushbu maxfiylik siyosati BotSpace (&quot;Platforma&quot;, &quot;biz&quot;) sizning
            ma&apos;lumotlaringizni qanday yig&apos;ishi, ishlatishi va himoya qilishini
            tushuntiradi. Platformadan foydalanib, siz ushbu siyosatga rozilik bildirasiz.
          </p>
        </Section>

        <Section title="2. Yig&apos;iladigan ma&apos;lumotlar">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-white/85">Hisob ma&apos;lumotlari:</span> ism, email,
              telefon raqami va autentifikatsiya ma&apos;lumotlari.
            </li>
            <li>
              <span className="text-white/85">Bot va kontent:</span> siz yaratgan bot
              oqimlari (flow), kolleksiyalar va sozlamalar.
            </li>
            <li>
              <span className="text-white/85">Credential&apos;lar:</span> Telegram bot
              tokenlari, API kalitlari va OAuth tokenlari — shifrlangan holda saqlanadi.
            </li>
            <li>
              <span className="text-white/85">Texnik ma&apos;lumotlar:</span> IP manzil,
              brauzer turi, foydalanish statistikasi.
            </li>
          </ul>
        </Section>

        <Section title="3. Ma&apos;lumotlardan foydalanish">
          <p>Yig&apos;ilgan ma&apos;lumotlarni quyidagi maqsadlarda ishlatamiz:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>xizmatni taqdim etish, botlaringizni ishga tushirish va sozlash;</li>
            <li>hisobingizni boshqarish va xavfsizlikni ta&apos;minlash;</li>
            <li>texnik qo&apos;llab-quvvatlash va xizmatni yaxshilash;</li>
            <li>to&apos;lovlarni qayta ishlash va qonuniy talablarni bajarish.</li>
          </ul>
        </Section>

        <Section title="4. Credential&apos;lar va shifrlash">
          <p>
            Bot tokenlari, API kalitlari va OAuth tokenlari kabi maxfiy ma&apos;lumotlar
            bazada <span className="text-white/85">shifrlangan</span> holda saqlanadi va hech
            qachon ochiq matnda ko&apos;rsatilmaydi. Ular faqat sizning botlaringizni ishga
            tushirish uchun, kerakli vaqtda serverda hal qilinadi (decrypt). Maxfiy
            ma&apos;lumotlar bot oqimi ichida saqlanmaydi.
          </p>
        </Section>

        <Section title="5. Uchinchi tomon xizmatlari">
          <p>
            Platforma quyidagi xizmatlar bilan integratsiya qiladi va sizning ruxsatingiz
            asosida ular bilan ma&apos;lumot almashadi:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-white/85">Telegram:</span> botlaringizni ishga tushirish
              uchun.
            </li>
            <li>
              <span className="text-white/85">Google (OAuth):</span> siz ulagan Google Sheets,
              Drive va boshqa xizmatlarga kirish uchun — faqat siz bergan ruxsat doirasida.
            </li>
            <li>
              <span className="text-white/85">To&apos;lov tizimlari:</span> obuna
              to&apos;lovlarini qayta ishlash uchun.
            </li>
          </ul>
        </Section>

        <Section title="6. Ma&apos;lumotlarni ulashish">
          <p>
            Biz sizning shaxsiy ma&apos;lumotlaringizni uchinchi tomonlarga sotmaymiz. Ularni
            faqat xizmatni taqdim etish uchun zarur bo&apos;lganda (masalan, hosting yoki
            to&apos;lov provayderlari) yoki qonun talab qilganda ulashamiz.
          </p>
        </Section>

        <Section title="7. Ma&apos;lumotlarni saqlash va xavfsizlik">
          <p>
            Ma&apos;lumotlaringizni xizmat ko&apos;rsatish uchun zarur bo&apos;lgan muddatda
            saqlaymiz. Sanoat standartidagi xavfsizlik choralarini qo&apos;llaymiz, biroq
            internet orqali uzatishning 100% xavfsizligini kafolatlab bo&apos;lmaydi.
          </p>
        </Section>

        <Section title="8. Sizning huquqlaringiz">
          <p>
            Siz o&apos;z ma&apos;lumotlaringizni ko&apos;rish, tahrirlash yoki o&apos;chirish
            huquqiga egasiz. Hisobingizni o&apos;chirsangiz, tegishli ma&apos;lumotlar va
            credential&apos;lar o&apos;chiriladi. So&apos;rovlar uchun biz bilan bog&apos;laning.
          </p>
        </Section>

        <Section title="9. O&apos;zgarishlar">
          <p>
            Ushbu siyosatni vaqti-vaqti bilan yangilashimiz mumkin. Muhim o&apos;zgarishlar
            haqida sizni xabardor qilamiz. Eng so&apos;nggi versiya har doim ushbu sahifada
            bo&apos;ladi.
          </p>
        </Section>

        <Section title="10. Bog&apos;lanish">
          <p>
            Maxfiylik bo&apos;yicha savollar uchun:{" "}
            <a href="mailto:support@botspace.uz" className="text-primary hover:underline">
              support@botspace.uz
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
