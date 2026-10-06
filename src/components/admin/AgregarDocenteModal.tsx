import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { crearDocente } from "../../service/admin.service";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}

const DOMINIO = "@ietirafaelnaviaron.edu.co";

export default function AgregarDocenteModal({
  visible,
  onClose,
  onCreado,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function limpiarYCerrar() {
    setNombre("");
    setApellido("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    onClose();
  }

  async function handleCrear() {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert(
        "Campos requeridos",
        "Ingresa el nombre y apellido del docente.",
      );
      return;
    }
    if (!email.trim()) {
      Alert.alert("Correo requerido", "Ingresa el correo del docente.");
      return;
    }
    if (!email.endsWith(DOMINIO)) {
      Alert.alert(
        "Correo inválido",
        `Solo se permiten correos institucionales (${DOMINIO}).`,
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await crearDocente(
        email.trim().toLowerCase(),
        password,
        `${nombre.trim()} ${apellido.trim()}`,
      );
      Alert.alert(
        "✓ Docente creado",
        `La cuenta de ${nombre.trim()} ${apellido.trim()} fue creada exitosamente.`,
        [
          {
            text: "Aceptar",
            onPress: () => {
              limpiarYCerrar();
              onCreado();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el docente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>Agregar docente</Text>
            <TouchableOpacity onPress={limpiarYCerrar}>
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={Colors.grisOscuro}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.campos}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del docente"
                  placeholderTextColor={Colors.grisMedio}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apellido del docente"
                  placeholderTextColor={Colors.grisMedio}
                  value={apellido}
                  onChangeText={setApellido}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo institucional</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`correo${DOMINIO}`}
                  placeholderTextColor={Colors.grisMedio}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña temporal</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.grisMedio}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Colors.grisMedio}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleCrear}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.blanco} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={18}
                    color={Colors.blanco}
                  />
                  <Text style={styles.buttonTexto}>Crear docente</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.blanco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitulo: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  campos: { gap: 14, marginBottom: 20 },
  inputGroup: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  input: {
    backgroundColor: Colors.fondoApp,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
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
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonTexto: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.blanco,
  },
});
