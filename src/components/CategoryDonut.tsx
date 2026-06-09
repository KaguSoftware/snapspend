import { Text, View } from "react-native";
import { Pie, PolarChart } from "victory-native";

import { categoryMeta } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import type { MonthlySummary } from "@/lib/queries";

interface CategoryDonutProps {
  summary: MonthlySummary;
  currency: string;
}

export function CategoryDonut({ summary, currency }: CategoryDonutProps) {
  const data = summary.byCategory.map(({ category, amount }) => {
    const meta = categoryMeta(category);
    return { label: meta.label, value: amount, color: meta.color };
  });

  if (data.length === 0) return null;

  return (
    <View>
      <View style={{ height: 200 }}>
        <PolarChart data={data} labelKey="label" valueKey="value" colorKey="color">
          <Pie.Chart innerRadius="72%" />
        </PolarChart>
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Text className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Total spent</Text>
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-50">
            {formatMoney(summary.total, currency)}
          </Text>
        </View>
      </View>

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
