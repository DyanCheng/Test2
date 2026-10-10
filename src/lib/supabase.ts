import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) throw new SupabaseConfigurationError();
  return supabase;
}

let anonymousSignIn: Promise<SupabaseClient> | null = null;

/** Gives the app a persistent, device-local identity without an email or password. */
export async function getAuthenticatedSupabaseClient(): Promise<SupabaseClient> {
  const client = getSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (session) return client;

  if (!anonymousSignIn) {
    anonymousSignIn = (async () => {
      const { error } = await client.auth.signInAnonymously();
      if (error) throw error;
      return client;
    })().finally(() => {
      anonymousSignIn = null;
    });
  }
  return anonymousSignIn;
}
