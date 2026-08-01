import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { iniciarSesionConGoogleNativo } from "../service/auth.service";
import { useAuthStore } from "../store/authStore";

const WEB_CLIENT_ID =
  "780674740973-rfmogdirib3qaoo768gob3l6p5qdbrfq.apps.googleusercontent.com";

// Configurar Google Sign-In una sola vez
GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: false,
  forceCodeForRefreshToken: false,
});

export function useGoogleAuth(
  onSuccess: () => void,
  onError: (msg: string) => void,
) {
  const [isLoading, setIsLoading] = useState(false);
  const { setIsGoogleAuth } = useAuthStore();

  async function promptAsync() {
    setIsLoading(true);
    setIsGoogleAuth(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In exitoso:", userInfo.data?.user?.email);

      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }

      const data = await iniciarSesionConGoogleNativo(idToken);
      console.log("Supabase session:", !!data.session);

      // Liberamos el flag
      setIsGoogleAuth(false);

      // Forzamos la actualización del store con la sesión nueva
      if (data.session) {
        const {
          setSession,
          setRole,
          setIsLoading: setStoreLoading,
        } = useAuthStore.getState();

        try {
          const { obtenerPerfil } = await import("../service/auth.service");
          const profile = await obtenerPerfil(data.session.user.id);
          setSession(data.session);
          setRole(profile.role as "estudiante" | "docente");
          setStoreLoading(false);
        } catch {
          setSession(data.session);
          setRole("estudiante");
          setStoreLoading(false);
        }
      }

      onSuccess();
    } catch (error: any) {
      setIsGoogleAuth(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Usuario canceló el sign-in de Google");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in ya en progreso");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError("Google Play Services no está disponible en este dispositivo");
      } else {
        console.log("Error Google Sign-In:", error);
        onError(error.message || "Error al iniciar sesión con Google");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { promptAsync, isLoading };
}
