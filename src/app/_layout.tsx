import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Linking } from "react-native";
import "react-native-reanimated";
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
    setSession,
    setRole,
    setIsLoading,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Escucha cambios de sesión en tiempo real
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (useAuthStore.getState().isRegistering) return;

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

  // Redirige según sesión y rol
  useEffect(() => {
    console.log(
      "ESTADO ACTUAL -> isLoading:",
      isLoading,
      "fontsLoaded:",
      fontsLoaded,
      "session:",
      !!session,
      "role:",
      role,
      "segments:",
      segments,
    );

    if (isLoading || !fontsLoaded) return;

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
  }, [session, role, isLoading, fontsLoaded, isRegistering, segments]);

  // Oculta splash cuando las fuentes estén listas
  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Maneja el deep link cuando la app ya está abierta
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("recuperar-password")) {
        router.push("/(auth)/nueva-password");
      }
    });

    // Maneja el deep link cuando la app estaba cerrada
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("recuperar-password")) {
        router.push("/(auth)/nueva-password");
      }
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded || isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(teacher)" />
    </Stack>
  );
}
