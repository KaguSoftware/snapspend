import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const containerStyles: Record<Variant, string> = {
  primary: "bg-brand-600 active:bg-brand-700",
  secondary: "bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:active:bg-zinc-700",
  ghost: "bg-transparent active:bg-zinc-100 dark:active:bg-zinc-800",
  destructive: "bg-red-600 active:bg-red-700",
};

const textStyles: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-zinc-900 dark:text-zinc-100",
  ghost: "text-brand-600 dark:text-brand-400",
  destructive: "text-white",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className,
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={`h-14 flex-row items-center justify-center rounded-2xl px-6 ${containerStyles[variant]} ${
        inactive ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? undefined : "#fff"} />
      ) : (
        <Text className={`font-semibold text-base ${textStyles[variant]}`}>{title}</Text>
      )}
    </Pressable>
  );
}
