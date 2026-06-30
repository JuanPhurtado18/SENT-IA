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

  const { session, role, isLoading, setSession, setRole, setIsLoading } =
    useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Escucha cambios de sesión en tiempo real
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("AUTH EVENT:", event, "Session existe:", !!newSession);
      setSession(newSession);

      if (newSession?.user) {
        try {
          const profile = await obtenerPerfil(newSession.user.id);
          console.log("PROFILE OBTENIDO:", profile);
          setRole(profile.role as "estudiante" | "docente");
        } catch (err) {
          console.log("ERROR AL OBTENER PERFIL:", err);
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
  }, [session, role, isLoading, fontsLoaded, segments]);

  // Oculta splash cuando las fuentes estén listas
  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(teacher)" />
    </Stack>
  );
}
