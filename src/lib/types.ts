export type Category =
  | "groceries"
  | "dining"
  | "transport"
  | "shopping"
  | "utilities"
  | "health"
  | "entertainment"
  | "other";

export type ReceiptStatus = "processing" | "done" | "failed";
export type ReceiptSource = "scan" | "manual";

export interface Receipt {
  id: string;
  user_id: string;
  image_path: string | null;
  merchant: string | null;
  total: number | null;
  currency: string;
  purchased_at: string | null;
  category: Category;
  status: ReceiptStatus;
  source: ReceiptSource;
  raw_extraction: unknown;
  created_at: string;
}

export interface LineItem {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
}

export interface ReceiptWithItems extends Receipt {
  line_items: LineItem[];
}
