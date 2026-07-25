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
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function ActualizarPasswordScreen() {
  const router = useRouter();
  const { setIsRecuperandoPassword } = useAuthStore();
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleActualizarPassword() {
    if (!nuevaPassword || !confirmarPassword) {
      Alert.alert("Campos requeridos", "Por favor completa ambos campos.");
      return;
    }
    if (nuevaPassword.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      Alert.alert(
        "Contraseñas no coinciden",
        "Verifica que ambas contraseñas sean iguales.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaPassword,
      });
      if (error) throw error;

      await supabase.auth.signOut();
      setIsRecuperandoPassword(false);

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
              color={Colors.verdePrincipal}
            />
          </View>
        </View>

        <Text style={styles.titulo}>Nueva contraseña</Text>
        <Text style={styles.subtitulo}>
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
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
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
              secureTextEntry={!showConfirmar}
              autoCapitalize="none"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)}>
              <MaterialCommunityIcons
                name={showConfirmar ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={Colors.grisMedio}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
          onPress={handleActualizarPassword}
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
  container: {
    flexGrow: 1,
    backgroundColor: Colors.fondoApp,
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 32,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.verdeClaro,
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
