import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { supabase } from "../../lib/supabase";
import { actualizarPassword } from "../../service/auth.service";

export default function NuevaPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLista, setSessionLista] = useState(false);

  useEffect(() => {
    // Supabase envía el token en los params del deep link
    // Cuando onAuthStateChange detecta PASSWORD_RECOVERY, la sesión ya está lista
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionLista(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleActualizar() {
    if (!password || !confirmPassword) {
      Alert.alert("Campos requeridos", "Por favor completa ambos campos.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Contraseñas no coinciden",
        "Verifica que ambas contraseñas sean iguales.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await actualizarPassword(password);
      await supabase.auth.signOut();
      Alert.alert(
        "¡Contraseña actualizada!",
        "Tu contraseña fue cambiada exitosamente. Inicia sesión con tu nueva contraseña.",
        [
          {
            text: "Ir al login",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo actualizar la contraseña.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!sessionLista) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
        <Text style={styles.loadingText}>Verificando enlace...</Text>
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
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={48}
              color={Colors.azulPrincipal}
            />
          </View>
        </View>

        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.grisMedio}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={Colors.grisMedio}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu contraseña"
              placeholderTextColor={Colors.grisMedio}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <MaterialCommunityIcons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={Colors.grisMedio}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
          onPress={handleActualizar}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.blanco} />
          ) : (
            <Text style={styles.buttonPrimaryText}>Actualizar contraseña</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.fondoApp,
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 32,
  },
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
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
    marginBottom: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
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
});
