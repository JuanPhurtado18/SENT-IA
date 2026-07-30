import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { iniciarSesionConGoogle } from "../service/auth.service";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID =
  "780674740973-f92kkau2t67k3f57f32kfv9nv387a9v1.apps.googleusercontent.com";
const WEB_CLIENT_ID =
  "780674740973-rfmogdirib3qaoo768gob3l6p5qdbrfq.apps.googleusercontent.com";

// Construye la URI según el entorno
function obtenerRedirectUri(): string {
  const isExpoGo = Constants.appOwnership === "expo";
  const expoUsername = "juanpabloh18";
  const slug = "sent-ia";

  if (isExpoGo) {
    return `https://auth.expo.io/@${expoUsername}/${slug}`;
  }

  return makeRedirectUri({
    scheme: "sentia",
    path: "auth/callback",
  });
}

export function useGoogleAuth(
  onSuccess: () => void,
  onError: (msg: string) => void,
) {
  const redirectUri = obtenerRedirectUri();
  const isExpoGo = Constants.appOwnership === "expo";

  console.log("Redirect URI:", redirectUri);
  console.log("Es Expo Go:", isExpoGo);

  // En Expo Go usamos el Web Client ID para ambos porque el proxy
  // de auth.expo.io solo funciona con credenciales web
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: isExpoGo ? WEB_CLIENT_ID : ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (request) {
      console.log("Request URL completa:", request.url);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      const accessToken = response.authentication?.accessToken;

      if (idToken && accessToken) {
        iniciarSesionConGoogle(idToken, accessToken)
          .then(() => onSuccess())
          .catch((err) =>
            onError(err.message || "Error al iniciar sesión con Google"),
          );
      } else {
        onError("No se pudo obtener los tokens de Google");
      }
    } else if (response?.type === "error") {
      onError("Error en la autenticación con Google");
    }
  }, [response]);

  return { request, promptAsync };
}
