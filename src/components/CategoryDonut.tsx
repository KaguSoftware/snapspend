import { Platform, Text, View } from "react-native";
import { Pie, PolarChart } from "victory-native";

import { categoryMeta } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import type { MonthlySummary } from "@/lib/queries";

interface CategoryDonutProps {
  summary: MonthlySummary;
  currency: string;
}

// Skia (CanvasKit) isn't configured for web, so the donut is native-only;
// web gets an equivalent bar breakdown instead.
function NativeDonut({ summary, currency }: CategoryDonutProps) {
  const data = summary.byCategory.map(({ category, amount }) => {
    const meta = categoryMeta(category);
    return { label: meta.label, value: amount, color: meta.color };
  });

  return (
    <View style={{ height: 200 }}>
      <PolarChart data={data} labelKey="label" valueKey="value" colorKey="color">
        <Pie.Chart innerRadius="72%" />
      </PolarChart>
      <View
        className="absolute inset-0 items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <Text className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Total spent</Text>
        <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-50">
          {formatMoney(summary.total, currency)}
        </Text>
      </View>
    </View>
  );
}

function WebBars({ summary, currency }: CategoryDonutProps) {
  return (
    <View className="gap-3 py-2">
      <View className="items-center pb-2">
        <Text className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Total spent</Text>
        <Text className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
          {formatMoney(summary.total, currency)}
        </Text>
      </View>
      {summary.byCategory.map(({ category, amount }) => {
        const meta = categoryMeta(category);
        const pct = summary.total > 0 ? (amount / summary.total) * 100 : 0;
        return (
          <View key={category} className="gap-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                <Text className="font-medium text-xs text-zinc-600 dark:text-zinc-300">
                  {meta.label}
                </Text>
              </View>
              <Text className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                {formatMoney(amount, currency)}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <View
                className="h-2 rounded-full"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: meta.color }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function CategoryDonut({ summary, currency }: CategoryDonutProps) {
  if (summary.byCategory.length === 0) return null;

  if (Platform.OS === "web") {
    return <WebBars summary={summary} currency={currency} />;
  }

  return (
    <View>
      <NativeDonut summary={summary} currency={currency} />
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
        {summary.byCategory.slice(0, 4).map(({ category, amount }) => {
          const meta = categoryMeta(category);
          const pct = summary.total > 0 ? Math.round((amount / summary.total) * 100) : 0;
          return (
            <View key={category} className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              <Text className="font-sans text-xs text-zinc-600 dark:text-zinc-300">
                {meta.label} {pct}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
