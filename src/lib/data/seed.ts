import { subDays } from "date-fns";

import type { Category, ReceiptWithItems } from "../types";

let counter = 0;
export function uid(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

interface SeedSpec {
  merchant: string;
  category: Category;
  daysAgo: number;
  items: [name: string, quantity: number, unitPrice: number][];
}

const SEEDS: SeedSpec[] = [
  {
    merchant: "Whole Foods Market",
    category: "groceries",
    daysAgo: 1,
    items: [
      ["Organic bananas", 1, 1.49],
      ["Sourdough loaf", 1, 4.99],
      ["Oat milk 1L", 2, 3.29],
      ["Free-range eggs (12)", 1, 5.49],
    ],
  },
  {
    merchant: "Shell",
    category: "transport",
    daysAgo: 2,
    items: [["Unleaded 95, 38.2L", 1, 54.6]],
  },
  {
    merchant: "Chipotle",
    category: "dining",
    daysAgo: 3,
    items: [
      ["Chicken burrito bowl", 1, 11.95],
      ["Guacamole", 1, 2.85],
      ["Sparkling water", 1, 2.5],
    ],
  },
  {
    merchant: "Netflix",
    category: "entertainment",
    daysAgo: 5,
    items: [["Standard plan (monthly)", 1, 15.49]],
  },
  {
    merchant: "CVS Pharmacy",
    category: "health",
    daysAgo: 6,
    items: [
      ["Ibuprofen 200mg", 1, 8.79],
      ["Vitamin D3", 1, 12.49],
    ],
  },
  {
    merchant: "Uniqlo",
    category: "shopping",
    daysAgo: 8,
    items: [
      ["Airism t-shirt", 2, 14.9],
      ["Linen shirt", 1, 29.9],
    ],
  },
  {
    merchant: "Trader Joe's",
    category: "groceries",
    daysAgo: 10,
    items: [
      ["Mandarin chicken", 1, 6.49],
      ["Cold brew concentrate", 1, 7.99],
      ["Everything bagel seasoning", 1, 2.99],
      ["Frozen mango chunks", 2, 2.79],
    ],
  },
  {
    merchant: "City Power & Light",
    category: "utilities",
    daysAgo: 12,
    items: [["Electricity — May statement", 1, 86.4]],
  },
  {
    merchant: "Uber",
    category: "transport",
    daysAgo: 15,
    items: [["Trip: Downtown → Airport", 1, 32.75]],
  },
  {
    merchant: "Blue Bottle Coffee",
    category: "dining",
    daysAgo: 18,
    items: [
      ["Flat white", 2, 5.5],
      ["Almond croissant", 1, 4.75],
    ],
  },
  {
    merchant: "Costco",
    category: "groceries",
    daysAgo: 34,
    items: [
      ["Rotisserie chicken", 1, 4.99],
      ["Paper towels 12pk", 1, 19.99],
      ["Olive oil 2L", 1, 16.49],
      ["Mixed nuts 1.1kg", 1, 14.99],
    ],
  },
  {
    merchant: "AMC Theatres",
    category: "entertainment",
    daysAgo: 38,
    items: [
      ["Adult ticket", 2, 14.5],
      ["Large popcorn", 1, 9.25],
    ],
  },
  {
    merchant: "Verizon",
    category: "utilities",
    daysAgo: 41,
    items: [["Unlimited plan (monthly)", 1, 70.0]],
  },
  {
    merchant: "Sweetgreen",
    category: "dining",
    daysAgo: 44,
    items: [["Harvest bowl", 1, 13.95]],
  },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildSeedReceipts(): ReceiptWithItems[] {
  const now = new Date();
  return SEEDS.map((spec, i) => {
    const id = uid();
    const date = subDays(now, spec.daysAgo);
    const total = round2(spec.items.reduce((sum, [, qty, price]) => sum + qty * price, 0));
    return {
      id,
      user_id: "mock-user",
      image_path: null,
      merchant: spec.merchant,
      total,
      currency: "USD",
      purchased_at: date.toISOString(),
      category: spec.category,
      status: "done",
      source: i % 3 === 0 ? "manual" : "scan",
      raw_extraction: null,
      created_at: date.toISOString(),
      line_items: spec.items.map(([name, quantity, unit_price]) => ({
        id: uid(),
        receipt_id: id,
        name,
        quantity,
        unit_price,
      })),
    };
  });
}
