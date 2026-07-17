import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { actualizarPerfil } from "../../service/auth.service";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGuardado: () => void;
  nombreActual: string;
  fotoActual: string | null;
  userId: string;
}

export default function EditarPerfilModal({
  visible,
  onClose,
  onGuardado,
  nombreActual,
  fotoActual,
  userId,
}: Props) {
  const [nombre, setNombre] = useState(nombreActual);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cuando se abre el modal, precarga el nombre actual
  useEffect(() => {
    if (visible) {
      setNombre(nombreActual);
      setFotoUri(null);
    }
  }, [visible, nombreActual]);

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para cambiar la foto.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  }

  async function handleGuardar() {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre no puede estar vacío.");
      return;
    }
    if (nombre.trim().length < 3) {
      Alert.alert(
        "Nombre muy corto",
        "El nombre debe tener al menos 3 caracteres.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await actualizarPerfil(userId, nombre.trim(), fotoUri || undefined);
      Alert.alert(
        "¡Perfil actualizado!",
        "Tus datos fueron guardados correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              onGuardado();
              onClose();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  // Determina qué imagen mostrar: nueva foto seleccionada, foto actual, o placeholder
  const imagenMostrar = fotoUri || fotoActual;
  const inicialNombre = nombre?.[0]?.toUpperCase() || "E";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalContainer}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Editar perfil</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.grisMedio}
                />
              </TouchableOpacity>
            </View>

            {/* FOTO */}
            <View style={styles.fotoSection}>
              <TouchableOpacity
                style={styles.fotoContainer}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {imagenMostrar ? (
                  <Image
                    source={{ uri: imagenMostrar, cache: "reload" }}
                    style={styles.fotoImagen}
                  />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <Text style={styles.fotoLetra}>{inicialNombre}</Text>
                  </View>
                )}
                <View style={styles.fotoEditBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={14}
                    color={Colors.blanco}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.fotoLabel}>Toca para cambiar la foto</Text>
              {fotoUri && (
                <TouchableOpacity onPress={() => setFotoUri(null)}>
                  <Text style={styles.fotoQuitarTexto}>Quitar foto nueva</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CAMPO NOMBRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor={Colors.grisMedio}
                autoCapitalize="words"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            {/* BOTONES */}
            <TouchableOpacity
              style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleGuardar}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.blanco} />
              ) : (
                <Text style={styles.buttonPrimaryText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    justifyContent: "flex-end",
    flexGrow: 1,
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
  fotoSection: {
    alignItems: "center",
    gap: 8,
  },
  fotoContainer: {
    position: "relative",
  },
  fotoImagen: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  fotoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
  },
  fotoLetra: {
    fontSize: 36,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  fotoEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.azulPrincipal,
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.blanco,
  },
  fotoLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  fotoQuitarTexto: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.rojoAlerta,
  },
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
