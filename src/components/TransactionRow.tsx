import { useRouter } from "expo-router";
import { Loader } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { categoryMeta } from "@/lib/categories";
import { formatDay, formatMoney } from "@/lib/format";
import type { ReceiptWithItems } from "@/lib/types";

export function TransactionRow({ receipt }: { receipt: ReceiptWithItems }) {
  const router = useRouter();
  const meta = categoryMeta(receipt.category);
  const processing = receipt.status === "processing";
  const Icon = processing ? Loader : meta.icon;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/receipt/[id]", params: { id: receipt.id } })}
      className="flex-row items-center gap-3 rounded-2xl px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${meta.color}26` }}
      >
        {processing ? (
          <ActivityIndicator size="small" color={meta.color} />
        ) : (
          <Icon size={20} color={meta.color} />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-medium text-base text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
          {processing ? "Reading receipt…" : (receipt.merchant ?? "Unknown merchant")}
        </Text>
        <Text className="font-sans text-xs text-zinc-500 dark:text-zinc-400">
          {processing ? "AI extraction in progress" : formatDay(receipt.purchased_at)}
        </Text>
      </View>
      <Text className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
        {processing ? "…" : formatMoney(receipt.total, receipt.currency)}
      </Text>
    </Pressable>
  );
}
