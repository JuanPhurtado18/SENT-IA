import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { obtenerPerfil } from "../service/auth.service";
import { useAuthStore } from "../store/authStore";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    session,
    role,
    isLoading,
    isRegistering,
    isRecuperandoPassword,
    isGoogleAuth,
    setSession,
    setRole,
    setIsLoading,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (useAuthStore.getState().isRegistering) return;
      if (useAuthStore.getState().isRecuperandoPassword) return;
      if (useAuthStore.getState().isGoogleAuth) return;

      setSession(newSession);

      if (newSession?.user) {
        try {
          const profile = await obtenerPerfil(newSession.user.id);
          setRole(profile.role as "estudiante" | "docente");
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (
      isLoading ||
      !fontsLoaded ||
      isRegistering ||
      isRecuperandoPassword ||
      isGoogleAuth
    )
      return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/bienvenida");
    } else if (session && role && inAuthGroup) {
      if (role === "docente") {
        router.replace("/(teacher)/dashboard");
      } else {
        router.replace("/(student)");
      }
    }
  }, [
    session,
    role,
    isLoading,
    fontsLoaded,
    isRegistering,
    isRecuperandoPassword,
    isGoogleAuth,
    segments,
  ]);

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(teacher)" />
      </Stack>
    </SafeAreaProvider>
  );
}
