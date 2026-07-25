import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  enviarCodigoRecuperacion,
  verificarCodigoOTP,
} from "../../service/auth.service";
import { useAuthStore } from "../../store/authStore";

type Paso = "correo" | "codigo";

function ocultarEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  const usuarioOculto =
    usuario.length <= 3 ? usuario[0] + "***" : usuario.slice(0, 3) + "***";
  return `${usuarioOculto}@${dominio}`;
}

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const { setIsRecuperandoPassword } = useAuthStore();
  const [paso, setPaso] = useState<Paso>("correo");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleEnviarCodigo() {
    if (!email.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa tu correo electrónico.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Correo inválido", "Por favor ingresa un correo válido.");
      return;
    }

    setIsLoading(true);
    try {
      await enviarCodigoRecuperacion(email.trim().toLowerCase());
      setPaso("codigo");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "No se pudo enviar el código. Verifica que el correo esté registrado.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerificarCodigo() {
    if (codigo.trim().length < 6) {
      Alert.alert("Código incompleto", "El código debe tener 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setIsRecuperandoPassword(true);
    try {
      await verificarCodigoOTP(email.trim().toLowerCase(), codigo.trim());
      router.push("/(auth)/actualizar-password");
    } catch (error: any) {
      setIsRecuperandoPassword(false);
      Alert.alert(
        "Código incorrecto",
        "El código no es válido o ya expiró. Intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (paso === "correo") router.back();
            else setPaso("correo");
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.grisOscuro}
          />
        </TouchableOpacity>

        {/* PASO 1 — CORREO */}
        {paso === "correo" && (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={48}
                  color={Colors.azulPrincipal}
                />
              </View>
            </View>
            <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitulo}>
              Ingresa tu correo y te enviaremos un código de verificación.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={Colors.grisMedio}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <TouchableOpacity
              style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleEnviarCodigo}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.blanco} />
              ) : (
                <Text style={styles.buttonPrimaryText}>Enviar código</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelarTexto}>Volver al login</Text>
            </TouchableOpacity>
          </>
        )}

        {/* PASO 2 — CÓDIGO */}
        {paso === "codigo" && (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="email-check-outline"
                  size={48}
                  color={Colors.azulPrincipal}
                />
              </View>
            </View>
            <Text style={styles.titulo}>Revisa tu correo</Text>
            <Text style={styles.subtitulo}>
              Enviamos un código de 6 dígitos a{" "}
              <Text style={styles.emailDestacado}>{ocultarEmail(email)}</Text>
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código de verificación</Text>
              <TextInput
                style={[styles.input, styles.inputCodigo]}
                placeholder="000000"
                placeholderTextColor={Colors.grisMedio}
                keyboardType="number-pad"
                maxLength={6}
                value={codigo}
                onChangeText={setCodigo}
                textAlign="center"
              />
            </View>
            <TouchableOpacity
              style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleVerificarCodigo}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.blanco} />
              ) : (
                <Text style={styles.buttonPrimaryText}>Verificar código</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={handleEnviarCodigo}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelarTexto}>
                ¿No recibiste el código? Reenviar
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.fondoApp,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.azulClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emailDestacado: {
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  inputCodigo: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 12,
    paddingVertical: 20,
  },
  buttonPrimary: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  cancelarButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  cancelarTexto: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.azulPrincipal,
  },
});
