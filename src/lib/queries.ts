import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, parseISO, startOfMonth } from "date-fns";
import { useMemo } from "react";

import {
  createManualExpense,
  createScanReceipt,
  deleteReceipt,
  getReceipt,
  listReceipts,
  type ManualExpenseInput,
  type ReceiptPatch,
  runMockExtraction,
  updateReceipt,
} from "./data/receipts";
import type { Category, ReceiptWithItems } from "./types";

export const receiptKeys = {
  all: ["receipts"] as const,
  detail: (id: string) => ["receipts", id] as const,
};

export function useReceipts() {
  return useQuery({ queryKey: receiptKeys.all, queryFn: listReceipts });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: () => getReceipt(id),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 800 : false),
  });
}

export interface MonthlySummary {
  total: number;
  byCategory: { category: Category; amount: number }[];
  receipts: ReceiptWithItems[];
}

export function useMonthlySummary(month: Date): {
  summary: MonthlySummary | undefined;
  isLoading: boolean;
  refetch: () => void;
  isRefetching: boolean;
} {
  const { data, isLoading, refetch, isRefetching } = useReceipts();

  const summary = useMemo<MonthlySummary | undefined>(() => {
    if (!data) return undefined;
    const from = startOfMonth(month).getTime();
    const to = endOfMonth(month).getTime();
    const receipts = data.filter((r) => {
      const t = parseISO(r.purchased_at ?? r.created_at).getTime();
      return t >= from && t <= to;
    });
    const done = receipts.filter((r) => r.status === "done" && r.total != null);
    const total = done.reduce((sum, r) => sum + (r.total ?? 0), 0);
    const byCategoryMap = new Map<Category, number>();
    for (const r of done) {
      byCategoryMap.set(r.category, (byCategoryMap.get(r.category) ?? 0) + (r.total ?? 0));
    }
    const byCategory = [...byCategoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { total, byCategory, receipts };
  }, [data, month]);

  return { summary, isLoading, refetch, isRefetching };
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const receipt = await createScanReceipt(imageUri);
      // Fire-and-forget: the mock extraction (stand-in for the Claude vision
      // edge function) completes in the background; detail queries poll it.
      runMockExtraction(receipt.id).finally(() => {
        queryClient.invalidateQueries({ queryKey: receiptKeys.all });
        queryClient.invalidateQueries({ queryKey: receiptKeys.detail(receipt.id) });
      });
      return receipt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receiptKeys.all }),
  });
}

export function useCreateManualExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualExpenseInput) => createManualExpense(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receiptKeys.all }),
  });
}

export function useUpdateReceipt(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ReceiptPatch) => updateReceipt(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReceipt(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receiptKeys.all }),
  });
}
