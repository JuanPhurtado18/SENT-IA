import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { cerrarSesion, registrarEstudiante } from "../../service/auth.service";
import { useAuthStore } from "../../store/authStore";

const GRADOS = [
  "6-1°",
  "6-2°",
  "6-3°",
  "7-1°",
  "7-2°",
  "7-3°",
  "8-1°",
  "8-2°",
  "8-3°",
  "9-1°",
  "9-2°",
  "9-3°",
  "10-1°",
  "10-2°",
  "10-3°",
  "11-1°",
  "11-2°",
  "11-3°",
];
const INSTITUCION = "Rafael Navia Varon";

export default function RegistroPaso2Screen() {
  const router = useRouter();
  const { nombreCompleto, email, fotoUri } = useLocalSearchParams<{
    nombreCompleto: string;
    email: string;
    fotoUri: string;
  }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [grado, setGrado] = useState("");
  const [gradoOpen, setGradoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsRegistering } = useAuthStore();

  async function handleRegistrar() {
    if (!password || !confirmPassword || !grado) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
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
    setIsRegistering(true);

    try {
      await registrarEstudiante(
        email,
        password,
        nombreCompleto,
        INSTITUCION,
        grado,
        fotoUri || undefined,
      );
      await cerrarSesion();
      setIsRegistering(false);
      router.replace("/(auth)/login");
      Alert.alert(
        "¡Cuenta creada!",
        "Tu cuenta fue creada exitosamente. Inicia sesión para continuar.",
      );
    } catch (error: any) {
      setIsRegistering(false);
      Alert.alert("Error al registrarse", error.message || "Intenta de nuevo.");
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
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.grisOscuro}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.stepLabel}>Paso 2 de 2</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Institución educativa</Text>
          <View style={styles.inputDeshabilitado}>
            <Text style={styles.inputDeshabilitadoTexto}>{INSTITUCION}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grado</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setGradoOpen(!gradoOpen)}
            activeOpacity={0.8}
          >
            <Text
              style={
                grado
                  ? styles.dropdownTextoSeleccionado
                  : styles.dropdownPlaceholder
              }
            >
              {grado || "Selecciona tu grado"}
            </Text>
            <MaterialCommunityIcons
              name={gradoOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>
          {gradoOpen && (
            <View style={styles.dropdownMenu}>
              {GRADOS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.dropdownItem,
                    grado === g && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setGrado(g);
                    setGradoOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemTexto,
                      grado === g && styles.dropdownItemTextoSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
          onPress={handleRegistrar}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.blanco} />
          ) : (
            <Text style={styles.buttonPrimaryText}>Crear cuenta</Text>
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
    paddingTop: 48,
    paddingBottom: 32,
  },
  backButton: { marginBottom: 16, alignSelf: "flex-start" },
  title: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.azulClaro,
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.azulPrincipal,
    borderRadius: 2,
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
  inputDeshabilitado: {
    backgroundColor: Colors.azulClaro,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    justifyContent: "center",
  },
  inputDeshabilitadoTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  dropdownButton: {
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  dropdownTextoSeleccionado: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
  },
  dropdownMenu: {
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    marginTop: 4,
    elevation: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.azulClaro,
  },
  dropdownItemTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
  },
  dropdownItemTextoSelected: {
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  buttonPrimary: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
