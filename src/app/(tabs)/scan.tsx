import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Images, ScanLine } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useCreateScan } from "@/lib/queries";

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const createScan = useCreateScan();

  const startProcessing = async (imageUri: string) => {
    const receipt = await createScan.mutateAsync(imageUri);
    router.push({ pathname: "/receipt/[id]", params: { id: receipt.id } });
  };

  const capture = async () => {
    if (busy || !cameraRef.current) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) await startProcessing(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    if (busy) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setBusy(true);
      try {
        await startProcessing(result.assets[0].uri);
      } finally {
        setBusy(false);
      }
    }
  };

  if (!permission) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-100 dark:bg-brand-900">
          <Camera size={36} color="#059669" />
        </View>
        <Text className="text-center font-semibold text-xl text-zinc-900 dark:text-zinc-50">
          Camera access needed
        </Text>
        <Text className="text-center font-sans text-sm leading-5 text-zinc-500 dark:text-zinc-400">
          SnapSpend uses your camera to scan receipts. Photos stay on your device until you save
          them.
        </Text>
        <Button title="Allow camera" onPress={requestPermission} className="mt-2 self-stretch" />
        <Button title="Pick from gallery instead" variant="ghost" onPress={pickFromGallery} />
      </Screen>
    );
  }

  return (
    <Screen edgeTop={false}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="flex-1 justify-between">
          <View className="items-center pt-20">
            <View className="flex-row items-center gap-2 rounded-full bg-black/50 px-4 py-2">
              <ScanLine size={16} color="#34d399" />
              <Text className="font-medium text-sm text-white">Align the receipt in frame</Text>
            </View>
          </View>

          <View className="mx-10 aspect-[3/4] rounded-3xl border-2 border-dashed border-white/60" />

          <View className="flex-row items-center justify-center gap-12 pb-12">
            <Pressable
              onPress={pickFromGallery}
              className="h-14 w-14 items-center justify-center rounded-full bg-black/50 active:bg-black/70"
              accessibilityLabel="Pick a receipt photo from the gallery"
            >
              <Images size={24} color="#fff" />
            </Pressable>
            <Pressable
              onPress={capture}
              disabled={busy}
              accessibilityLabel="Capture receipt"
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/30 active:bg-white/50"
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="h-14 w-14 rounded-full bg-white" />
              )}
            </Pressable>
            <View className="h-14 w-14" />
          </View>
        </View>
      </CameraView>
    </Screen>
  );
}
