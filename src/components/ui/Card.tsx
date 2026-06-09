import { View, type ViewProps } from "react-native";

export function Card({ children, className, ...rest }: ViewProps) {
  return (
    <View
      className={`rounded-3xl bg-card-light p-4 shadow-sm dark:bg-card-dark ${className ?? ""}`}
      {...rest}
    >
      {children}
    </View>
  );
}
