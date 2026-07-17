import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { cambiarPassword } from "../../service/auth.service";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CambiarPasswordModal({ visible, onClose }: Props) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function limpiarYCerrar() {
    setPasswordActual("");
    setPasswordNueva("");
    setConfirmarPassword("");
    setShowActual(false);
    setShowNueva(false);
    setShowConfirmar(false);
    onClose();
  }

  async function handleCambiar() {
    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
      return;
    }
    if (passwordNueva.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }
    if (passwordNueva !== confirmarPassword) {
      Alert.alert(
        "Contraseñas no coinciden",
        "La nueva contraseña y su confirmación no son iguales.",
      );
      return;
    }
    if (passwordActual === passwordNueva) {
      Alert.alert(
        "Contraseña igual",
        "La nueva contraseña debe ser diferente a la actual.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await cambiarPassword(passwordActual, passwordNueva);
      Alert.alert(
        "¡Contraseña actualizada!",
        "Tu contraseña fue cambiada exitosamente.",
        [{ text: "Aceptar", onPress: limpiarYCerrar }],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar la contraseña.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={limpiarYCerrar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Cambiar contraseña</Text>
            <TouchableOpacity onPress={limpiarYCerrar}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.grisMedio}
              />
            </TouchableOpacity>
          </View>

          {/* CAMPO CONTRASEÑA ACTUAL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña actual</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Tu contraseña actual"
                placeholderTextColor={Colors.grisMedio}
                secureTextEntry={!showActual}
                autoCapitalize="none"
                value={passwordActual}
                onChangeText={setPasswordActual}
              />
              <TouchableOpacity onPress={() => setShowActual(!showActual)}>
                <MaterialCommunityIcons
                  name={showActual ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={Colors.grisMedio}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CAMPO CONTRASEÑA NUEVA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.grisMedio}
                secureTextEntry={!showNueva}
                autoCapitalize="none"
                value={passwordNueva}
                onChangeText={setPasswordNueva}
              />
              <TouchableOpacity onPress={() => setShowNueva(!showNueva)}>
                <MaterialCommunityIcons
                  name={showNueva ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={Colors.grisMedio}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CAMPO CONFIRMAR CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repite tu nueva contraseña"
                placeholderTextColor={Colors.grisMedio}
                secureTextEntry={!showConfirmar}
                autoCapitalize="none"
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmar(!showConfirmar)}
              >
                <MaterialCommunityIcons
                  name={showConfirmar ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={Colors.grisMedio}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTONES */}
          <TouchableOpacity
            style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
            onPress={handleCambiar}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.blanco} />
            ) : (
              <Text style={styles.buttonPrimaryText}>
                Actualizar contraseña
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={limpiarYCerrar}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonSecondaryText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.blanco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  inputGroup: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.fondoApp,
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
    elevation: 2,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  buttonSecondary: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: Colors.grisMedio,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
});
