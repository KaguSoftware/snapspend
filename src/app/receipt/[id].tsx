import { format, isValid, parseISO } from "date-fns";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Sparkles, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { CategoryChips } from "@/components/CategoryChips";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { formatMoney } from "@/lib/format";
import { useDeleteReceipt, useReceipt, useUpdateReceipt } from "@/lib/queries";
import type { Category, ReceiptWithItems } from "@/lib/types";

function ProcessingState() {
  return (
    <Animated.View entering={FadeIn} className="items-center gap-4 px-8 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-100 dark:bg-brand-900">
        <Sparkles size={36} color="#059669" />
      </View>
      <ActivityIndicator color="#059669" />
      <Text className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
        Reading your receipt…
      </Text>
      <Text className="text-center font-sans text-sm leading-5 text-zinc-500 dark:text-zinc-400">
        AI is extracting the merchant, date, total and line items. This usually takes a few
        seconds.
      </Text>
    </Animated.View>
  );
}

function ReceiptForm({ receipt }: { receipt: ReceiptWithItems }) {
  const router = useRouter();
  const updateReceipt = useUpdateReceipt(receipt.id);

  const [merchant, setMerchant] = useState(receipt.merchant ?? "");
  const [total, setTotal] = useState(receipt.total != null ? String(receipt.total) : "");
  const [date, setDate] = useState(
    receipt.purchased_at ? format(parseISO(receipt.purchased_at), "yyyy-MM-dd") : "",
  );
  const [category, setCategory] = useState<Category>(receipt.category);

  const save = async () => {
    const parsedTotal = Number(total.replace(",", "."));
    if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
      Alert.alert("Invalid amount", "Enter the total as a number, e.g. 23.50");
      return;
    }
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD, e.g. 2026-06-09");
      return;
    }
    await updateReceipt.mutateAsync({
      merchant: merchant.trim() || "Unknown merchant",
      total: parsedTotal,
      purchased_at: parsedDate.toISOString(),
      category,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <ScrollView contentContainerClassName="gap-4 px-5 pb-10" keyboardShouldPersistTaps="handled">
        {receipt.image_path ? (
          <Animated.View entering={FadeInDown.duration(350)}>
            <Image
              source={{ uri: receipt.image_path }}
              style={{ width: "100%", height: 220, borderRadius: 24 }}
              contentFit="cover"
              transition={200}
            />
          </Animated.View>
        ) : null}

        <Card className="gap-4">
          <Input label="Merchant" value={merchant} onChangeText={setMerchant} />
          <Input
            label={`Total (${receipt.currency})`}
            value={total}
            onChangeText={setTotal}
            keyboardType="decimal-pad"
          />
          <Input
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />
          <View className="gap-2">
            <Text className="font-medium text-sm text-zinc-600 dark:text-zinc-400">Category</Text>
            <CategoryChips value={category} onChange={setCategory} />
          </View>
        </Card>

        {receipt.line_items.length > 0 ? (
          <Card className="gap-1">
            <Text className="pb-2 font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Line items
            </Text>
            {receipt.line_items.map((item) => (
              <View key={item.id} className="flex-row items-center justify-between py-1.5">
                <Text
                  className="flex-1 font-sans text-sm text-zinc-700 dark:text-zinc-300"
                  numberOfLines={1}
                >
                  {item.quantity > 1 ? `${item.quantity} × ` : ""}
                  {item.name}
                </Text>
                <Text className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  {formatMoney(item.quantity * item.unit_price, receipt.currency)}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Button title="Save changes" onPress={save} loading={updateReceipt.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: receipt, isLoading } = useReceipt(id);
  const deleteReceipt = useDeleteReceipt();

  const confirmDelete = () => {
    Alert.alert("Delete receipt", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteReceipt.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 py-2">
        <Pressable onPress={() => router.back()} className="h-12 w-12 justify-center" hitSlop={8}>
          <ArrowLeft size={24} color="#71717a" />
        </Pressable>
        <Text className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Receipt</Text>
        <Pressable
          onPress={confirmDelete}
          className="h-12 w-12 items-end justify-center"
          hitSlop={8}
          accessibilityLabel="Delete receipt"
        >
          <Trash2 size={22} color="#ef4444" />
        </Pressable>
      </View>

      {isLoading || !receipt ? (
        <View className="items-center py-20">
          <ActivityIndicator color="#059669" />
        </View>
      ) : receipt.status === "processing" ? (
        <ProcessingState />
      ) : (
        // Keyed by id so the form state re-initializes per receipt.
        <ReceiptForm key={receipt.id} receipt={receipt} />
      )}
    </Screen>
  );
}
