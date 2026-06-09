import { format, isValid, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { CategoryChips } from "@/components/CategoryChips";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useCreateManualExpense } from "@/lib/queries";
import type { Category } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

export default function AddExpense() {
  const router = useRouter();
  const { user } = useAuth();
  const createExpense = useCreateManualExpense();

  const [merchant, setMerchant] = useState("");
  const [total, setTotal] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState<Category>("other");

  const save = async () => {
    const parsedTotal = Number(total.replace(",", "."));
    if (!merchant.trim()) {
      Alert.alert("Missing merchant", "Who did you pay?");
      return;
    }
    if (Number.isNaN(parsedTotal) || parsedTotal <= 0) {
      Alert.alert("Invalid amount", "Enter the total as a number, e.g. 23.50");
      return;
    }
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD, e.g. 2026-06-09");
      return;
    }
    await createExpense.mutateAsync({
      merchant: merchant.trim(),
      total: parsedTotal,
      currency: user?.currency ?? "USD",
      purchased_at: parsedDate.toISOString(),
      category,
    });
    router.back();
  };

  return (
    <Screen edgeTop={Platform.OS === "android"}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="font-bold text-xl text-zinc-900 dark:text-zinc-50">Add expense</Text>
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
          hitSlop={8}
        >
          <X size={20} color="#71717a" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="gap-4 px-5 pb-10" keyboardShouldPersistTaps="handled">
          <Input label="Merchant" placeholder="e.g. Blue Bottle Coffee" value={merchant} onChangeText={setMerchant} />
          <Input
            label={`Total (${user?.currency ?? "USD"})`}
            placeholder="0.00"
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
          <Button title="Save expense" onPress={save} loading={createExpense.isPending} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
