// Mock repository API — same shape the Supabase implementation will have.
// See BACKEND_NOTES.md for the swap plan.

import type { Category, LineItem, ReceiptWithItems } from "../types";
import { uid } from "./seed";
import { loadReceipts, saveReceipts } from "./store";

export async function listReceipts(): Promise<ReceiptWithItems[]> {
  const receipts = await loadReceipts();
  return [...receipts].sort((a, b) =>
    (b.purchased_at ?? b.created_at).localeCompare(a.purchased_at ?? a.created_at),
  );
}

export async function getReceipt(id: string): Promise<ReceiptWithItems | null> {
  const receipts = await loadReceipts();
  return receipts.find((r) => r.id === id) ?? null;
}

export async function createScanReceipt(imageUri: string): Promise<ReceiptWithItems> {
  const receipts = await loadReceipts();
  const now = new Date().toISOString();
  const receipt: ReceiptWithItems = {
    id: uid(),
    user_id: "mock-user",
    image_path: imageUri,
    merchant: null,
    total: null,
    currency: "USD",
    purchased_at: now,
    category: "other",
    status: "processing",
    source: "scan",
    raw_extraction: null,
    created_at: now,
    line_items: [],
  };
  await saveReceipts([receipt, ...receipts]);
  return receipt;
}

export interface ManualExpenseInput {
  merchant: string;
  total: number;
  currency: string;
  purchased_at: string;
  category: Category;
}

export async function createManualExpense(input: ManualExpenseInput): Promise<ReceiptWithItems> {
  const receipts = await loadReceipts();
  const receipt: ReceiptWithItems = {
    id: uid(),
    user_id: "mock-user",
    image_path: null,
    ...input,
    status: "done",
    source: "manual",
    raw_extraction: null,
    created_at: new Date().toISOString(),
    line_items: [],
  };
  await saveReceipts([receipt, ...receipts]);
  return receipt;
}

export interface ReceiptPatch {
  merchant?: string;
  total?: number;
  currency?: string;
  purchased_at?: string;
  category?: Category;
  line_items?: LineItem[];
}

export async function updateReceipt(id: string, patch: ReceiptPatch): Promise<ReceiptWithItems> {
  const receipts = await loadReceipts();
  const index = receipts.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Receipt not found");
  const updated: ReceiptWithItems = { ...receipts[index], ...patch };
  const next = [...receipts];
  next[index] = updated;
  await saveReceipts(next);
  return updated;
}

export async function deleteReceipt(id: string): Promise<void> {
  const receipts = await loadReceipts();
  await saveReceipts(receipts.filter((r) => r.id !== id));
}

// --- Mock AI extraction -----------------------------------------------------
// In production this is the `extract-receipt` Supabase Edge Function calling
// Claude vision (see supabase/functions/extract-receipt/). Here we simulate
// the latency and fill in plausible data.

const MOCK_EXTRACTIONS: {
  merchant: string;
  category: Category;
  items: [string, number, number][];
}[] = [
  {
    merchant: "Target",
    category: "shopping",
    items: [
      ["Desk lamp", 1, 24.99],
      ["AA batteries 8pk", 1, 7.49],
      ["Notebook 3pk", 1, 6.99],
    ],
  },
  {
    merchant: "Safeway",
    category: "groceries",
    items: [
      ["Chicken breast 1kg", 1, 9.99],
      ["Basmati rice 2kg", 1, 8.49],
      ["Greek yogurt", 3, 1.79],
      ["Baby spinach", 1, 3.99],
    ],
  },
  {
    merchant: "Shake Shack",
    category: "dining",
    items: [
      ["ShackBurger", 1, 8.39],
      ["Crinkle fries", 1, 4.29],
      ["Lemonade", 1, 3.59],
    ],
  },
  {
    merchant: "Walgreens",
    category: "health",
    items: [
      ["Allergy relief 30ct", 1, 18.99],
      ["Hand sanitizer", 2, 2.99],
    ],
  },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function runMockExtraction(id: string): Promise<ReceiptWithItems> {
  // Simulated network + model latency.
  await new Promise((resolve) => setTimeout(resolve, 2800));

  const pick = MOCK_EXTRACTIONS[Math.floor(Math.random() * MOCK_EXTRACTIONS.length)];
  const line_items: LineItem[] = pick.items.map(([name, quantity, unit_price]) => ({
    id: uid(),
    receipt_id: id,
    name,
    quantity,
    unit_price,
  }));
  const total = round2(line_items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0));

  const receipts = await loadReceipts();
  const index = receipts.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Receipt not found");

  const updated: ReceiptWithItems = {
    ...receipts[index],
    merchant: pick.merchant,
    category: pick.category,
    total,
    status: "done",
    raw_extraction: { mock: true, confidence: 0.93 },
    line_items,
  };
  const next = [...receipts];
  next[index] = updated;
  await saveReceipts(next);
  return updated;
}
