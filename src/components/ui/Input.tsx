import { forwardRef } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-medium text-sm text-zinc-600 dark:text-zinc-400">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#71717a"
        className={`h-14 rounded-2xl border border-zinc-200 bg-card-light px-4 font-sans text-base text-zinc-900 focus:border-brand-500 dark:border-zinc-700 dark:bg-card-dark dark:text-zinc-100 ${
          error ? "border-red-500" : ""
        } ${className ?? ""}`}
        {...rest}
      />
      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
});
