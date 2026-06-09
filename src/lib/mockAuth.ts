// Mock auth — stands in for Supabase Auth until a project slot is available.
// See BACKEND_NOTES.md. Same async shape as the real implementation.

import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "snapspend.user.v1";

export interface MockUser {
  email: string;
  displayName: string;
  currency: string;
}

export async function getStoredUser(): Promise<MockUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as MockUser) : null;
}

export async function signUp(displayName: string, email: string, _password: string): Promise<MockUser> {
  const user: MockUser = { email: email.trim().toLowerCase(), displayName: displayName.trim(), currency: "USD" };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function signIn(email: string, _password: string): Promise<MockUser> {
  const existing = await getStoredUser();
  const user: MockUser =
    existing && existing.email === email.trim().toLowerCase()
      ? existing
      : { email: email.trim().toLowerCase(), displayName: email.split("@")[0], currency: "USD" };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function updateUser(patch: Partial<MockUser>): Promise<MockUser> {
  const existing = await getStoredUser();
  if (!existing) throw new Error("Not signed in");
  const user = { ...existing, ...patch };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
