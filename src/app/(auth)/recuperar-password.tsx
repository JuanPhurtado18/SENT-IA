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
import { enviarEmailRecuperacion } from "../../service/auth.service";

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleEnviar() {
    if (!email.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa tu correo electrónico.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert(
        "Correo inválido",
        "Por favor ingresa un correo electrónico válido.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await enviarEmailRecuperacion(email.trim().toLowerCase());
      setEnviado(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo enviar el correo. Intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (enviado) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <MaterialCommunityIcons
              name="email-check-outline"
              size={48}
              color={Colors.verdePrincipal}
            />
          </View>
          <Text style={styles.successTitle}>Correo enviado</Text>
          <Text style={styles.successText}>
            Revisa tu bandeja de entrada en{" "}
            <Text style={styles.emailHighlight}>{email}</Text> y toca el enlace
            para crear tu nueva contraseña.
          </Text>
          <Text style={styles.successHint}>
            Si no lo encuentras, revisa tu carpeta de spam.
          </Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonPrimaryText}>Volver al login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.grisOscuro}
          />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={48}
              color={Colors.azulPrincipal}
            />
          </View>
        </View>

        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace para crear una nueva
          contraseña.
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
          onPress={handleEnviar}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.blanco} />
          ) : (
            <Text style={styles.buttonPrimaryText}>Enviar enlace</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => router.back()}
        >
          <Text style={styles.backToLoginText}>Volver al login</Text>
        </TouchableOpacity>
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
  backButton: { marginBottom: 24, alignSelf: "flex-start" },
  iconContainer: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.azulClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: { marginBottom: 24 },
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
  buttonPrimary: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  backToLogin: { alignItems: "center", paddingVertical: 8 },
  backToLoginText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.verdeClaro,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  successText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  successHint: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
  },
});
