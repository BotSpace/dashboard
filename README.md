# Botmother — Dashboard

Foydalanuvchi paneli + landing sayt. Botmother platformasidagi bot loyihalaringizni boshqarish uchun web ilova.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** komponentlari (Radix UI primitives)
- **next-intl** — uz / en / ru tarjimalari
- **next-themes** — light / dark / system rejimi
- **react-hook-form** + **zod** — forma va validatsiya
- **sonner** — toast notifications
- **input-otp** — OTP kod kiritish
- **jose** — JWT sessiya cookie

Auth flow: native Server Actions + httpOnly cookie sessiya (NextAuth.js o'rniga yengilroq variant). Server tomonda fetch wrapper bilan backend va auth servislariga so'rovlar yuboriladi, 401 da access token avtomatik yangilanadi.

## Yo'l xaritasi (loyiha strukturasi)

```
src/
├── app/
│   ├── layout.tsx               # root pass-through
│   └── [locale]/
│       ├── layout.tsx           # html/body + providers
│       ├── (public)/            # landing
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── (auth)/              # login / register / forgot-password
│       │   ├── layout.tsx
│       │   ├── login/
│       │   ├── register/
│       │   └── forgot-password/
│       └── (app)/               # himoyalangan dashboard
│           ├── layout.tsx       # sidebar + topbar
│           └── app/
│               ├── page.tsx                  # /app
│               ├── bots/                     # /app/bots, /new, /[id]/...
│               │   └── [id]/
│               │       ├── page.tsx          # overview
│               │       ├── editor/           # bot-constructor iframe
│               │       ├── messages/
│               │       ├── collections/
│               │       ├── files/
│               │       ├── env/
│               │       ├── releases/
│               │       ├── monitoring/
│               │       └── plan/
│               ├── templates/                # marketplace
│               ├── files/                    # global files
│               ├── billing/
│               ├── tickets/
│               └── settings/
├── features/
│   ├── landing/                 # hero, features, pricing, cta, public-header/footer
│   ├── auth/                    # actions, schemas, forms
│   ├── app-shell/               # sidebar, top-bar, user-menu, mobile-sidebar
│   ├── dashboard/               # stats-cards, recent-bots
│   ├── bots/                    # actions, create-form, env-list, deploy, tabs
│   └── settings/                # profile-form, password-form
├── shared/
│   ├── api/                     # client.ts (fetch wrapper), server.ts (refresh-aware), services.ts
│   ├── auth/                    # session.ts (jose JWT cookie)
│   ├── components/
│   │   ├── ui/                  # shadcn primitives
│   │   └── common/              # logo, theme-toggle, language-switcher
│   ├── i18n/                    # routing.ts, request.ts
│   ├── lib/                     # env.ts, utils.ts, constants.ts
│   ├── messages/                # uz.json, en.json, ru.json
│   ├── providers/               # theme-provider, toaster
│   └── types/                   # api.ts (Project, Release, Plan, ...)
└── middleware.ts                # locale + auth gate
```

## Mahalliy ishga tushirish

1. Dependencies o'rnatish:

```bash
npm install
```

2. `.env.example` ni `.env.local` ga nusxalash va to'ldirish:

```bash
cp .env.example .env.local
```

3. Backend, auth va bot-constructor servislari ishga tushgan bo'lishi kerak:
   - Django backend → `http://localhost:8000`
   - Go auth servis → `http://localhost:8080`
   - bot-constructor-panel → `http://localhost:3001`

4. Dev serverni ishga tushirish:

```bash
npm run dev
```

Dashboard `http://localhost:3010` da ochiladi.

## Env vars

| O'zgaruvchi | Tavsifi |
|---|---|
| `NEXT_PUBLIC_API_URL` | Django backend bazaviy URL |
| `NEXT_PUBLIC_AUTH_URL` | Go auth servis bazaviy URL |
| `NEXT_PUBLIC_CONSTRUCTOR_URL` | Bot constructor (iframe uchun) |
| `NEXT_PUBLIC_SITE_URL` | Saytning kanonik URL'i |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (browser tomonida) |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `uz` / `en` / `ru` |
| `SESSION_COOKIE_NAME` | Sessiya cookie nomi (default: `bm_session`) |
| `SESSION_SECRET` | Sessiya JWT secret (min 16 belgi) |

## Build va Production

```bash
npm run build
npm run start
```

## Backend integratsiyasi

**Auth (Go) — `/api/v1/auth/*`**:
- `POST /login` — phone + password → access + refresh
- `POST /register` — phone + name + password → OTP yuborish
- `POST /confirm` — phone + code → access + refresh
- `POST /refresh` — refresh → yangi access
- `POST /google` — id_token → access + refresh
- `GET  /me` — joriy user (Bearer)

**Backend (Django) — `/api/v1/*`**:
- `/project` — Bot/Project CRUD
- `/relase` — Releases
- `/enviroment` — Env vars
- `/plans`, `/project/{id}/plan` — tariflar
- `/file` — fayllar
- `/collection` — collectionlar (MongoDB)
- `/template/list`, `/template/order`, `/template/submission`, `/template/withdrawal` — marketplace
- `/message` — broadcast
- `/history`, `/transaction`, `/user/balance` — billing
- `/ticket` — support

Barcha so'rovlar `Bearer {access_token}` bilan boradi va 401 holatida automatic refresh qilinadi (`src/shared/api/server.ts`).

## Yo'naltirilgan ishlar

- Telegram OTP login (qo'shimcha provider sifatida)
- Web Push notifications
- API tokenlar tab'i (settings/tokens)
- Drag-and-drop fayl yuklash
- Collection rows CRUD UI
- Real-time monitoring (WebSocket)
- Payme/Click pul to'ldirish modal
- Templates submission flow (yangilash/yaratish)
- Withdrawal request form
- Telegram Login Widget integratsiyasi
