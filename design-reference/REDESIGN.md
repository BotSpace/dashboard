# BotSpace redesign (claude.ai/design)

Manba dizayn: https://claude.ai/design/p/28651304-7a17-49ec-b357-825fd6b42f94
Mockup: [`BotSpace.dc.html`](./BotSpace.dc.html) (132KB, 14 ekran).

Bu **`botspace-redesign` branch** — `main`'ga TEGMAYDI, deploy bo'lmaydi. Ko'rib chiqish uchun.
Qaytarish: `git branch -D botspace-redesign` yoki branch'ni o'chirish.

## Bajarilgan (1-bosqich — poydevor)
- **`src/app/globals.css`** — `.dark` palitra mockup ranglariga moslandi
  (bg `#0a0a0c`, primary `#3b82f6`, accent yashil, muted `#8a8a93`, border oq/8%).
  App allaqachon `forcedTheme="dark"` — shu sabab butun ilova avtomatik yangi
  ko'rinishni oladi (barcha shadcn komponentlar shu tokenlardan foydalanadi).
- **Typografiya** — Inter (asosiy) + Space Grotesk (`--font-display`, sarlavhalar
  uchun) Google Fonts orqali ulandi; `--font-sans` Inter'ga o'tdi.

Bu o'zgarishlar **bitta CSS faylida** — eng past xavf, oson qaytariladi, butun
ilovani mockup estetikasiga keltiradi (komponentlarni qayta yozmasdan).

## Keyingi bosqichlar (mockupdagi 14 ekran)
LOGIN, APP SHELL (sidebar/header), DASHBOARD, AI AGENT, BOTLAR, YANGI BOT,
BOT DETAIL, SHABLONLAR MARKETPLACE, CREDENTIALS, DAROMAD, MUROJAATLAR,
SOZLAMALAR, MCP, CONSTRUCTOR.

Tavsiya: har ekranni alohida olib, mavjud sahifa komponentini mockup layoutiga
moslab boring (kartalar, sidebar, stat bloklar). Token poydevori tayyor —
qolgani layout/komponent ishi.

## Qanday ko'rish
```bash
git checkout botspace-redesign
npm run dev   # 3001 yoki dashboard porti
```
Mockupni brauzerda ochish: `design-reference/BotSpace.dc.html`.
