import { useRouter } from "expo-router";
import { Plus, ReceiptText } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { CategoryDonut } from "@/components/CategoryDonut";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { TransactionRow } from "@/components/TransactionRow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMonthlySummary } from "@/lib/queries";
import { useAuth } from "@/providers/AuthProvider";

function DashboardSkeleton() {
  return (
    <View className="gap-4 px-5">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [month, setMonth] = useState(() => new Date());
  const { summary, isLoading, refetch, isRefetching } = useMonthlySummary(month);

  const currency = user?.currency ?? "USD";
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
        <View>
          <Text className="font-sans text-sm text-zinc-500 dark:text-zinc-400">Hi {firstName} 👋</Text>
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-50">Your spending</Text>
        </View>
        <Pressable
          onPress={() => router.push("/add-expense")}
          className="h-11 w-11 items-center justify-center rounded-full bg-brand-600 active:bg-brand-700"
          accessibilityLabel="Add expense manually"
        >
          <Plus size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading || !summary ? (
        <DashboardSkeleton />
      ) : (
        <FlatList
          data={summary.receipts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerClassName="pb-8 px-5 gap-1"
          ListHeaderComponent={
            <View className="gap-4 pb-3">
              <MonthSwitcher month={month} onChange={setMonth} />
              <Animated.View entering={FadeInDown.duration(400)}>
                <Card>
                  {summary.byCategory.length > 0 ? (
                    <CategoryDonut summary={summary} currency={currency} />
                  ) : (
                    <View className="items-center gap-1 py-8">
                      <Text className="font-sans text-sm text-zinc-500 dark:text-zinc-400">
                        Nothing spent this month
                      </Text>
                      <Text className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                        {currency} 0.00
                      </Text>
                    </View>
                  )}
                </Card>
              </Animated.View>
              {summary.receipts.length > 0 ? (
                <Text className="pt-1 font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Transactions · {summary.receipts.length}
                </Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <TransactionRow receipt={item} />}
          ListEmptyComponent={
            <EmptyState
              icon={ReceiptText}
              title="No receipts yet"
              message="Scan your first receipt from the Scan tab, or add an expense manually with the + button."
            />
          }
        />
      )}
    </Screen>
  );
}
