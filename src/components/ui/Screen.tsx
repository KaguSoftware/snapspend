import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps extends ViewProps {
  /** Apply top safe-area padding (off for screens under a header/tab bar that handles it). */
  edgeTop?: boolean;
}

export function Screen({ children, className, edgeTop = true, style, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 bg-surface-light dark:bg-surface-dark ${className ?? ""}`}
      style={[edgeTop ? { paddingTop: insets.top } : null, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
