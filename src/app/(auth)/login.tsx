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
import { iniciarSesion } from "../../service/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert(
        "Campos requeridos",
        "Por favor ingresa tu correo y contraseña.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await iniciarSesion(email.trim().toLowerCase(), password);
      // La redirección la maneja el _layout.tsx raíz via onAuthStateChange
    } catch (error: any) {
      Alert.alert(
        "Error al ingresar",
        error.message || "Verifica tus credenciales.",
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
          <MaterialCommunityIcons
            name="account-circle"
            size={72}
            color={Colors.azulPrincipal}
          />
        </View>

        <Text style={styles.title}>Bienvenido/a</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
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

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/(auth)/recuperar-password")}
        >
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.blanco} />
          ) : (
            <Text style={styles.buttonPrimaryText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>o</Text>
          <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity
          style={styles.buttonGoogle}
          onPress={() =>
            Alert.alert(
              "Próximamente",
              "El login con Google estará disponible pronto.",
            )
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="google"
            size={20}
            color={Colors.azulPrincipal}
          />
          <Text style={styles.buttonGoogleText}>Continuar con Google</Text>
        </TouchableOpacity>

        <View style={styles.registerLink}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/registro-paso1")}
          >
            <Text style={styles.registerLinkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.fondoApp,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: { alignItems: "center", marginBottom: 16 },
  title: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    marginBottom: 32,
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
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.azulPrincipal,
  },
  buttonPrimary: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.azulClaro },
  separatorText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.azulClaro,
    backgroundColor: Colors.blanco,
    paddingVertical: 14,
    borderRadius: 24,
  },
  buttonGoogleText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  registerLinkText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
});
