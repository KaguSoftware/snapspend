import {
  Car,
  Clapperboard,
  HeartPulse,
  type LucideIcon,
  Plug,
  ShoppingBag,
  ShoppingCart,
  Tag,
  UtensilsCrossed,
} from "lucide-react-native";

import type { Category } from "./types";

export interface CategoryMeta {
  value: Category;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { value: "groceries", label: "Groceries", icon: ShoppingCart, color: "#10b981" },
  { value: "dining", label: "Dining", icon: UtensilsCrossed, color: "#f59e0b" },
  { value: "transport", label: "Transport", icon: Car, color: "#3b82f6" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "#ec4899" },
  { value: "utilities", label: "Utilities", icon: Plug, color: "#8b5cf6" },
  { value: "health", label: "Health", icon: HeartPulse, color: "#ef4444" },
  { value: "entertainment", label: "Entertainment", icon: Clapperboard, color: "#06b6d4" },
  { value: "other", label: "Other", icon: Tag, color: "#64748b" },
];

export const categoryMeta = (value: Category): CategoryMeta =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
