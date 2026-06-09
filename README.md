# SnapSpend 📸💸

**Snap a receipt → AI fills in the expense.** A cross-platform (iOS + Android)
expense tracker built with the current React Native industry stack.

> ⚠️ **Demo mode:** the app currently runs on a local mock data layer with
> simulated AI extraction — we hit Supabase's free-project account limit during
> development. The production backend (Postgres schema with RLS, private
> storage, and a Claude-vision edge function) is written and deploy-ready in
> [`supabase/`](supabase/). Details and the go-live checklist:
> [BACKEND_NOTES.md](BACKEND_NOTES.md).

## Features

- **Receipt scanning** — camera or gallery, with an animated processing state
  while AI extracts the merchant, date, total, category, and line items
- **Dashboard** — monthly spend with a month switcher, category donut chart
  (Skia-rendered), and a transaction list with pull-to-refresh
- **Edit anything** — receipt detail screen with image, editable fields,
  category chips, and line items; manual expense entry modal
- **Onboarding + auth** — swipeable intro slides, sign in / sign up flow with
  protected routes
- **Polish** — dark mode, Inter typography, haptics, skeleton loaders, empty
  states, Reanimated transitions

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Expo SDK 56 · React Native 0.85 · React 19 · TypeScript (strict) |
| Navigation | Expo Router (file-based, typed routes, protected stacks) |
| Styling | NativeWind 4 (Tailwind) · dark mode · Inter via expo-font |
| Data | TanStack Query 5 · AsyncStorage repo (mock) → Supabase (planned) |
| Charts | victory-native 41 (Skia) |
| AI | Claude vision (`claude-opus-4-8`) with strict JSON schema — edge function ready in `supabase/functions/extract-receipt/` |
| Builds | EAS (dev / preview / production profiles in `eas.json`) |

## Run it

```sh
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `a` for an Android
emulator. Sign up with any email/password (mock auth), then scan any photo —
extraction is simulated in demo mode.

### Scripts

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint (eslint)
```

## Project layout

```text
src/
  app/            # Expo Router screens: (auth), (tabs), receipt/[id], add-expense
  components/     # CategoryDonut, TransactionRow, MonthSwitcher, ui/ kit
  lib/            # types, categories, format, queries (TanStack), data/ (mock repo)
  providers/      # AuthProvider, QueryProvider
supabase/
  migrations/     # 0001_init.sql — schema, RLS, storage policies (deploy-ready)
  functions/      # extract-receipt — Claude vision edge function (deploy-ready)
```
