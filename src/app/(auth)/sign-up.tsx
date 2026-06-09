import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/providers/AuthProvider";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return setError("Tell us your name.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError(null);
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow px-6 pb-10" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} className="h-12 w-12 justify-center" hitSlop={8}>
            <ArrowLeft size={24} color="#71717a" />
          </Pressable>

          <View className="gap-2 py-6">
            <Text className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
              Create your account
            </Text>
            <Text className="font-sans text-base text-zinc-500 dark:text-zinc-400">
              Scan your first receipt in under a minute.
            </Text>
          </View>

          <View className="gap-4">
            <Input
              label="Name"
              autoComplete="name"
              placeholder="Alex Doe"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              secureTextEntry
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />
            {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
            <Button title="Create account" onPress={submit} loading={loading} className="mt-2" />
          </View>

          <View className="flex-row justify-center gap-1 pt-6">
            <Text className="font-sans text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.replace("/sign-in")}>
              <Text className="font-semibold text-sm text-brand-600 dark:text-brand-400">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
