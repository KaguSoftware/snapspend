import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryChipsProps {
  value: Category;
  onChange: (next: Category) => void;
}

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {CATEGORIES.map((meta) => {
        const selected = meta.value === value;
        return (
          <Pressable
            key={meta.value}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(meta.value);
            }}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              selected
                ? "border-brand-600 bg-brand-600"
                : "border-zinc-200 bg-card-light dark:border-zinc-700 dark:bg-card-dark"
            }`}
          >
            <meta.icon size={14} color={selected ? "#fff" : meta.color} />
            <Text
              className={`font-medium text-xs ${
                selected ? "text-white" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
