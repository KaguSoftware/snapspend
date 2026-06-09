# Backend status — read this before touching data code

**TL;DR: the app currently runs on a local mock data layer, not Supabase.** The
real backend is fully designed and the deploy-ready assets are in `supabase/`,
but it is not provisioned yet.

## Why

During initial development (June 2026) we tried to create the Supabase project
via MCP and hit this hard limit on the team's account:

> The following organization members have reached their maximum limits for the
> number of active free projects within organizations where they are an
> administrator or owner: bau.se.engineers@gmail.com (2 project limit).

Rather than block the app, everything was built against a mock layer with the
same API shape the Supabase implementation will have.

## What's mocked, and where

| Concern | Mock (current) | Real (planned) |
|---|---|---|
| Auth | `src/lib/mockAuth.ts` (AsyncStorage) | Supabase Auth (email/password) |
| Receipts/expenses DB | `src/lib/data/store.ts` + `src/lib/data/receipts.ts` (AsyncStorage, seeded) | Postgres tables in `supabase/migrations/0001_init.sql` (RLS owner-only) |
| Receipt images | Local file URIs | Storage bucket `receipts` (private, per-user folders) |
| AI extraction | `runMockExtraction()` in `src/lib/data/receipts.ts` (simulated latency + canned data) | Edge Function `supabase/functions/extract-receipt/` calling Claude vision (`claude-opus-4-8`) with strict JSON schema output |

`src/lib/queries.ts` (TanStack Query hooks) is the **only** consumer of the
mock repo, and `src/providers/AuthProvider.tsx` is the only consumer of mock
auth — the swap is contained to those import sites.

## How to go live

1. Free a project slot (pause/delete a free project at supabase.com/dashboard)
   or upgrade the org, then create a project named `snapspend`.
2. Apply `supabase/migrations/0001_init.sql` (creates schema, RLS, trigger,
   storage bucket + policies).
3. Deploy the edge function: `supabase functions deploy extract-receipt` and
   set the secret `ANTHROPIC_API_KEY`.
4. Add to `.env`: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   (client already exists at `src/lib/supabase.ts`).
5. Replace the internals of `src/lib/data/receipts.ts` with Supabase queries
   (table/column names already match the migration 1:1), point
   `AuthProvider` at Supabase Auth, and upload scan images to Storage before
   invoking the function.
6. Run Supabase advisors to confirm no RLS warnings.
