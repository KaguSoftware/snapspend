import { type LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-8 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
        <Icon size={28} color="#059669" />
      </View>
      <Text className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{title}</Text>
      <Text className="text-center font-sans text-sm leading-5 text-zinc-500 dark:text-zinc-400">
        {message}
      </Text>
    </View>
  );
}
