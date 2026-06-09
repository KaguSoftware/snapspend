import { addMonths, isSameMonth } from "date-fns";
import * as Haptics from "expo-haptics";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { formatMonthTitle } from "@/lib/format";

interface MonthSwitcherProps {
  month: Date;
  onChange: (next: Date) => void;
}

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const atCurrentMonth = isSameMonth(month, new Date());

  const shift = (delta: number) => {
    Haptics.selectionAsync();
    onChange(addMonths(month, delta));
  };

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={() => shift(-1)}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
      >
        <ChevronLeft size={22} color="#71717a" />
      </Pressable>
      <Text className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
        {formatMonthTitle(month)}
      </Text>
      <Pressable
        onPress={() => shift(1)}
        hitSlop={8}
        disabled={atCurrentMonth}
        className={`h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800 ${
          atCurrentMonth ? "opacity-30" : ""
        }`}
      >
        <ChevronRight size={22} color="#71717a" />
      </Pressable>
    </View>
  );
}
