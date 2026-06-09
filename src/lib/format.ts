import { format, parseISO } from "date-fns";

export function formatMoney(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDay(date: string | null | undefined): string {
  if (!date) return "Unknown date";
  try {
    return format(parseISO(date), "EEE, MMM d yyyy");
  } catch {
    return date;
  }
}

export function formatMonthTitle(monthStart: Date): string {
  return format(monthStart, "MMMM yyyy");
}
