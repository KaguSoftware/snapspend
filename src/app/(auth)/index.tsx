import { useRouter } from "expo-router";
import { ChartPie, ScanLine, Sparkles } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: ScanLine,
    title: "Snap any receipt",
    body: "Point your camera at a receipt and SnapSpend captures it in one tap.",
  },
  {
    icon: Sparkles,
    title: "AI does the typing",
    body: "Merchant, date, total, every line item — extracted automatically, no manual entry.",
  },
  {
    icon: ChartPie,
    title: "See where money goes",
    body: "Monthly totals and beautiful category breakdowns keep your spending honest.",
  },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.duration(500)} className="items-center pb-6">
          <Text className="font-bold text-4xl text-zinc-900 dark:text-zinc-50">
            Snap<Text className="text-brand-600">Spend</Text>
          </Text>
        </Animated.View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          style={{ flexGrow: 0 }}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center gap-5 px-10 py-8">
              <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-100 dark:bg-brand-900">
                <item.icon size={44} color="#059669" strokeWidth={1.8} />
              </View>
              <Text className="text-center font-semibold text-2xl text-zinc-900 dark:text-zinc-50">
                {item.title}
              </Text>
              <Text className="text-center font-sans text-base leading-6 text-zinc-500 dark:text-zinc-400">
                {item.body}
              </Text>
            </View>
          )}
        />

        <View className="flex-row justify-center gap-2 py-4">
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              className={`h-2 rounded-full ${i === page ? "w-6 bg-brand-600" : "w-2 bg-zinc-300 dark:bg-zinc-700"}`}
            />
          ))}
        </View>
      </View>

      <View className="gap-3 px-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Button title="Get started" onPress={() => router.push("/sign-up")} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.push("/sign-in")} />
      </View>
    </Screen>
  );
}
