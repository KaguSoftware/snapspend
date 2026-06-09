import { CloudOff, LogOut, RotateCcw } from "lucide-react-native";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { resetReceipts } from "@/lib/data/store";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

const CURRENCIES = ["USD", "EUR", "GBP", "SEK"];

export default function Settings() {
  const { user, signOut, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const confirmReset = () => {
    Alert.alert("Reset demo data", "This restores the sample receipts and removes your changes.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await resetReceipts();
          queryClient.invalidateQueries();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-10 pt-4">
        <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-50">Settings</Text>

        <Card className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-600">
            <Text className="font-bold text-xl text-white">
              {(user?.displayName?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              {user?.displayName}
            </Text>
            <Text className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</Text>
          </View>
        </Card>

        <Card className="gap-3">
          <Text className="font-semibold text-base text-zinc-900 dark:text-zinc-100">Currency</Text>
          <View className="flex-row gap-2">
            {CURRENCIES.map((code) => {
              const selected = user?.currency === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => updateUser({ currency: code })}
                  className={`rounded-full border px-4 py-2 ${
                    selected
                      ? "border-brand-600 bg-brand-600"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      selected ? "text-white" : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <CloudOff size={18} color="#f59e0b" />
            <Text className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Demo mode
            </Text>
          </View>
          <Text className="font-sans text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            This build runs on local sample data while the Supabase backend slot is pending — AI
            extraction is simulated. See BACKEND_NOTES.md in the repo for the swap plan.
          </Text>
          <Pressable
            onPress={confirmReset}
            className="flex-row items-center gap-2 self-start rounded-full bg-zinc-100 px-4 py-2 active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
          >
            <RotateCcw size={16} color="#71717a" />
            <Text className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Reset demo data
            </Text>
          </Pressable>
        </Card>

        <Pressable
          onPress={signOut}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 py-4 active:bg-red-50 dark:border-red-900 dark:active:bg-red-950"
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="font-semibold text-base text-red-500">Sign out</Text>
        </Pressable>

        <Text className="text-center font-sans text-xs text-zinc-400 dark:text-zinc-600">
          SnapSpend 1.0.0
        </Text>
      </ScrollView>
    </Screen>
  );
}
