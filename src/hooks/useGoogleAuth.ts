import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { iniciarSesionConGoogleNativo } from "../service/auth.service";
import { useAuthStore } from "../store/authStore";

const WEB_CLIENT_ID =
  "780674740973-rfmogdirib3qaoo768gob3l6p5qdbrfq.apps.googleusercontent.com";
const DOMINIO_PERMITIDO = "@ietirafaelnaviaron.edu.co";
const INSTITUCION = "Rafael Navia Varon";

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
      const email = userInfo.data?.user?.email || "";
      console.log("Google Sign-In exitoso:", email);

      // 1. Validar dominio
      if (!email.endsWith(DOMINIO_PERMITIDO)) {
        await GoogleSignin.signOut();
        setIsGoogleAuth(false);
        onError(
          `Solo se permiten correos institucionales (${DOMINIO_PERMITIDO}). Tu correo ${email} no está autorizado.`,
        );
        return;
      }

      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }

      const data = await iniciarSesionConGoogleNativo(idToken);
      console.log("Supabase session:", !!data.session);

      // 2. Asignar institución fija si el perfil no la tiene
      if (data.session) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("institucion, role")
          .eq("id", data.session.user.id)
          .single();

        if (!perfil?.institucion) {
          await supabase
            .from("profiles")
            .update({
              institucion: INSTITUCION,
              role: "estudiante",
            })
            .eq("id", data.session.user.id);
        }
      }

      setIsGoogleAuth(false);

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
