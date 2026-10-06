import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { bloquearPerfil, desbloquearPerfil } from "../../service/admin.service";

interface Props {
  visible: boolean;
  onClose: () => void;
  onActualizado: () => void;
  usuario: {
    id: string;
    nombre_completo: string;
    email: string;
    role: string;
    grado?: string;
    bloqueado: boolean;
  } | null;
}

export default function AdministrarPerfilModal({
  visible,
  onClose,
  onActualizado,
  usuario,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);

  async function handleBloquear() {
    if (!usuario) return;
    const accion = usuario.bloqueado ? "desbloquear" : "bloquear";
    Alert.alert(
      `${accion.charAt(0).toUpperCase() + accion.slice(1)} perfil`,
      `¿Confirmas que deseas ${accion} el perfil de ${usuario.nombre_completo}?${
        !usuario.bloqueado
          ? "\n\nSu sesión activa será cerrada inmediatamente."
          : ""
      }`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: accion.charAt(0).toUpperCase() + accion.slice(1),
          style: usuario.bloqueado ? "default" : "destructive",
          onPress: async () => {
            try {
              if (usuario.bloqueado) {
                setIsLoading(true);
                await desbloquearPerfil(usuario.id);
              } else {
                await bloquearPerfil(usuario.id);
              }
              await onActualizado(); // esperamos que termine
              onClose();
              setIsLoading(false);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  }

  if (!usuario) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>Administrar perfil</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={Colors.grisOscuro}
              />
            </TouchableOpacity>
          </View>

          {/* BADGE ROL */}
          <View
            style={[
              styles.rolBadge,
              {
                backgroundColor:
                  usuario.role === "docente" ? "#EEF4FF" : Colors.verdeClaro,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                usuario.role === "docente"
                  ? "school-outline"
                  : "account-outline"
              }
              size={14}
              color={
                usuario.role === "docente"
                  ? Colors.azulPrincipal
                  : Colors.verdePrincipal
              }
            />
            <Text
              style={[
                styles.rolTexto,
                {
                  color:
                    usuario.role === "docente"
                      ? Colors.azulPrincipal
                      : Colors.verdePrincipal,
                },
              ]}
            >
              {usuario.role === "docente" ? "Docente" : "Estudiante"}
            </Text>
          </View>

          {/* DATOS */}
          <View style={styles.datosContainer}>
            <View style={styles.datoFila}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color={Colors.grisMedio}
              />
              <View>
                <Text style={styles.datoLabel}>Nombre completo</Text>
                <Text style={styles.datoValor}>{usuario.nombre_completo}</Text>
              </View>
            </View>
            <View style={styles.datoFila}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={Colors.grisMedio}
              />
              <View>
                <Text style={styles.datoLabel}>Correo electrónico</Text>
                <Text style={styles.datoValor}>{usuario.email}</Text>
              </View>
            </View>
            {usuario.role === "estudiante" && usuario.grado && (
              <View style={styles.datoFila}>
                <MaterialCommunityIcons
                  name="book-outline"
                  size={18}
                  color={Colors.grisMedio}
                />
                <View>
                  <Text style={styles.datoLabel}>Grado</Text>
                  <Text style={styles.datoValor}>{usuario.grado}</Text>
                </View>
              </View>
            )}
          </View>

          {/* ESTADO BLOQUEO */}
          {usuario.bloqueado && (
            <View style={styles.bloqueadoBanner}>
              <MaterialCommunityIcons
                name="lock"
                size={16}
                color={Colors.rojoAlerta}
              />
              <Text style={styles.bloqueadoTexto}>
                Este perfil está bloqueado
              </Text>
            </View>
          )}

          {/* BOTÓN BLOQUEAR/DESBLOQUEAR */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: usuario.bloqueado
                  ? Colors.verdePrincipal
                  : Colors.rojoAlerta,
              },
            ]}
            onPress={handleBloquear}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={usuario.bloqueado ? "lock-open-outline" : "lock-outline"}
              size={18}
              color={Colors.blanco}
            />
            <Text style={styles.buttonTexto}>
              {usuario.bloqueado ? "Desbloquear perfil" : "Bloquear perfil"}
            </Text>
          </TouchableOpacity>
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
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitulo: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rolTexto: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  datosContainer: {
    gap: 12,
    backgroundColor: Colors.fondoApp,
    borderRadius: 12,
    padding: 16,
  },
  datoFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  datoLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  datoValor: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  bloqueadoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEB",
    borderRadius: 10,
    padding: 12,
  },
  bloqueadoTexto: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.rojoAlerta,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
    marginTop: 4,
  },
  buttonTexto: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.blanco,
  },
});
