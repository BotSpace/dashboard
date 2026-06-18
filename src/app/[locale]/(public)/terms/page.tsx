import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Foydalanish shartlari — BotSpace",
  description: "BotSpace platformasidan foydalanish shartlari va qoidalari.",
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

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Foydalanish shartlari</h1>
        <p className="text-sm text-white/50">Oxirgi yangilanish: {UPDATED}</p>
      </header>

      <div className="space-y-10">
        <Section title="1. Umumiy qoidalar">
          <p>
            Ushbu shartlar BotSpace (&quot;Platforma&quot;, &quot;biz&quot;) xizmatlaridan
            foydalanishni tartibga soladi. Platformadan ro&apos;yxatdan o&apos;tib yoki
            foydalanib, siz ushbu shartlarga rozilik bildirasiz. Agar shartlarga rozi
            bo&apos;lmasangiz, xizmatdan foydalanmang.
          </p>
        </Section>

        <Section title="2. Xizmat tavsifi">
          <p>
            BotSpace — Telegram botlarini vizual konstruktor orqali yaratish, sozlash va
            ishga tushirish imkonini beruvchi platforma. Xizmatlarga bot konstruktori, AI
            agentlar, ma&apos;lumotlar kolleksiyalari, integratsiyalar (Google, va boshqalar)
            va hosting kiradi. Biz xizmatlarni oldindan ogohlantirmasdan o&apos;zgartirish yoki
            to&apos;xtatish huquqini saqlab qolamiz.
          </p>
        </Section>

        <Section title="3. Hisob va xavfsizlik">
          <p>
            Siz hisobingiz va unga bog&apos;langan ma&apos;lumotlar (Telegram bot tokenlari,
            API kalitlari, credential&apos;lar) xavfsizligi uchun javobgarsiz. Hisobingizdagi
            barcha harakatlar uchun siz mas&apos;ulsiz. Ruxsatsiz foydalanishni sezsangiz,
            darhol bizga xabar bering.
          </p>
        </Section>

        <Section title="4. Foydalanish qoidalari">
          <p>Platformadan quyidagi maqsadlarda foydalanish taqiqlanadi:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>qonunga zid, firibgar yoki zararli kontent tarqatish;</li>
            <li>spam yuborish yoki Telegram qoidalarini buzish;</li>
            <li>boshqalarning huquqlarini buzuvchi botlar yaratish;</li>
            <li>platforma infratuzilmasiga zarar yetkazish yoki uni buzishga urinish.</li>
          </ul>
          <p>
            Yaratgan botlaringiz va ular orqali tarqatilgan kontent uchun to&apos;liq
            javobgarlik sizning zimmangizda.
          </p>
        </Section>

        <Section title="5. To&apos;lov va obunalar">
          <p>
            Ayrim imkoniyatlar pullik obuna asosida taqdim etiladi. Obuna narxlari va
            shartlari tarif sahifasida ko&apos;rsatiladi. To&apos;lovlar tanlangan davr uchun
            amalga oshiriladi; aks holda ko&apos;rsatilmasa, qaytarilmaydi. Narxlar
            o&apos;zgarishi mumkin; o&apos;zgarishlar oldindan e&apos;lon qilinadi.
          </p>
        </Section>

        <Section title="6. Uchinchi tomon xizmatlari">
          <p>
            Platforma Telegram, Google va boshqa uchinchi tomon xizmatlari bilan integratsiya
            qiladi. Ular bilan ishlashda tegishli xizmatlarning shartlari ham amal qiladi.
            Uchinchi tomon xizmatlarining ishlashi uchun biz javobgar emasmiz.
          </p>
        </Section>

        <Section title="7. Intellektual mulk">
          <p>
            Platformaning kodi, dizayni va brendi BotSpace ga tegishli. Siz yaratgan
            botlar va kontent sizniki bo&apos;lib qoladi; siz bizga ularni xizmat ko&apos;rsatish
            uchun zarur darajada ishlatish huquqini berasiz.
          </p>
        </Section>

        <Section title="8. Xizmatni to&apos;xtatish">
          <p>
            Ushbu shartlarni buzsangiz, biz hisobingizni ogohlantirish bilan yoki ogohlantirishsiz
            to&apos;xtatish huquqiga egamiz. Siz istalgan vaqtda hisobingizni o&apos;chirishingiz
            mumkin.
          </p>
        </Section>

        <Section title="9. Kafolatlardan voz kechish va javobgarlik">
          <p>
            Xizmat &quot;mavjud holatda&quot; taqdim etiladi. Biz xizmatning uzluksiz yoki
            xatosiz ishlashini kafolatlamaymiz. Qonun ruxsat etgan darajada, platformadan
            foydalanish natijasida yuzaga kelgan bilvosita yoki tasodifiy zararlar uchun
            javobgar emasmiz.
          </p>
        </Section>

        <Section title="10. O&apos;zgarishlar">
          <p>
            Ushbu shartlarni vaqti-vaqti bilan yangilashimiz mumkin. Muhim o&apos;zgarishlar
            haqida sizni xabardor qilamiz. Yangilanishdan keyin xizmatdan foydalanishni davom
            ettirish o&apos;zgartirilgan shartlarga rozilik hisoblanadi.
          </p>
        </Section>

        <Section title="11. Bog&apos;lanish">
          <p>
            Savollar bo&apos;yicha biz bilan bog&apos;laning:{" "}
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
