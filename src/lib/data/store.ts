// Mock persistence layer backed by AsyncStorage.
//
// NOTE: This stands in for Supabase (Postgres + Storage). We hit the free-tier
// project limit on the Supabase account during initial development — see
// BACKEND_NOTES.md at the repo root. The deploy-ready schema lives in
// supabase/migrations/, and src/lib/queries.ts is the only consumer of this
// module, so swapping to the real backend touches one file.

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ReceiptWithItems } from "../types";
import { buildSeedReceipts } from "./seed";

const STORAGE_KEY = "snapspend.receipts.v1";

let cache: ReceiptWithItems[] | null = null;

export async function loadReceipts(): Promise<ReceiptWithItems[]> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    cache = JSON.parse(raw) as ReceiptWithItems[];
  } else {
    cache = buildSeedReceipts();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
  return cache;
}

export async function saveReceipts(receipts: ReceiptWithItems[]): Promise<void> {
  cache = receipts;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export async function resetReceipts(): Promise<void> {
  cache = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
}
