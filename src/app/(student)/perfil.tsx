import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CambiarPasswordModal from "../../components/student/CambiarPasswordModal";
import { Colors } from "../../constants/Colors";
import {
  contarActividadesCompletadas,
  obtenerHistorialActividades,
} from "../../service/actividades.service";
import { cerrarSesion, obtenerPerfil } from "../../service/auth.service";
import { useAuthStore } from "../../store/authStore";

export default function PerfilScreen() {
  const { session } = useAuthStore();
  const [perfil, setPerfil] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [actividadesCompletadas, setActividadesCompletadas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarDatos();
    }, [session]),
  );

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const [perfilData, historialData, completadas] = await Promise.all([
        obtenerPerfil(session!.user.id),
        obtenerHistorialActividades(session!.user.id),
        contarActividadesCompletadas(session!.user.id),
      ]);
      setPerfil(perfilData);
      setHistorial(historialData);
      setActividadesCompletadas(completadas);
    } catch (error) {
      console.log("Error cargando perfil:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCerrarSesion() {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await cerrarSesion();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
      </View>
    );
  }

  const inicialNombre = perfil?.nombre_completo?.[0]?.toUpperCase() || "E";

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text style={styles.headerTitulo}>Mi perfil</Text>

        {/* AVATAR Y DATOS PRINCIPALES */}
        <View style={styles.avatarSection}>
          {perfil?.foto_url ? (
            <Image
              source={{ uri: perfil.foto_url }}
              style={styles.avatarImagen}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetra}>{inicialNombre}</Text>
            </View>
          )}
          <Text style={styles.nombreTexto}>{perfil?.nombre_completo}</Text>
          <Text style={styles.rolTexto}>
            Estudiante · Grado {perfil?.grado}
          </Text>
        </View>

        {/* TARJETA DE DATOS */}
        <View style={styles.datosCard}>
          <View style={styles.datoItem}>
            <Text style={styles.datoLabel}>Correo</Text>
            <Text style={styles.datoValor} numberOfLines={1}>
              {session?.user?.email}
            </Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.datoItem}>
            <Text style={styles.datoLabel}>Institución</Text>
            <Text style={styles.datoValor} numberOfLines={1}>
              {perfil?.institucion}
            </Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.datoItem}>
            <Text style={styles.datoLabel}>Actividades</Text>
            <Text style={styles.datoValorDestacado}>
              {actividadesCompletadas} completadas
            </Text>
          </View>
        </View>

        {/* HISTORIAL DE ACTIVIDADES */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>HISTORIAL DE ACTIVIDADES</Text>
          {historial.length === 0 ? (
            <Text style={styles.sinHistorialTexto}>
              Aún no has completado ninguna actividad.
            </Text>
          ) : (
            <View style={styles.historialCard}>
              {historial.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.historialItem}>
                    <Text style={styles.historialSemana}>
                      Semana {item.numero_semana}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        item.totalRespuestas >= 10
                          ? styles.badgeCompletada
                          : item.estado === "activa"
                            ? styles.badgeActiva
                            : styles.badgePendiente,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeTexto,
                          item.totalRespuestas >= 10
                            ? styles.badgeCompletadaTexto
                            : item.estado === "activa"
                              ? styles.badgeActivaTexto
                              : styles.badgePendienteTexto,
                        ]}
                      >
                        {item.totalRespuestas >= 10
                          ? "Completada"
                          : item.estado === "activa"
                            ? "En curso"
                            : "Incompleta"}
                      </Text>
                    </View>
                  </View>
                  {index < historial.length - 1 && (
                    <View style={styles.separador} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* OPCIONES */}
        <View style={styles.opcionesCard}>
          <TouchableOpacity
            style={styles.opcionItem}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.opcionLeft}>
              <View
                style={[
                  styles.opcionIconCircle,
                  { backgroundColor: Colors.azulClaro },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={18}
                  color={Colors.azulPrincipal}
                />
              </View>
              <Text style={styles.opcionTexto}>Cambiar contraseña</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>

          <View style={styles.separador} />

          <TouchableOpacity
            style={styles.opcionItem}
            onPress={handleCerrarSesion}
            activeOpacity={0.7}
          >
            <View style={styles.opcionLeft}>
              <View
                style={[
                  styles.opcionIconCircle,
                  { backgroundColor: "#FFEBEB" },
                ]}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={18}
                  color={Colors.rojoAlerta}
                />
              </View>
              <Text style={[styles.opcionTexto, { color: Colors.rojoAlerta }]}>
                Cerrar sesión
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={Colors.rojoAlerta}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CambiarPasswordModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
    gap: 20,
  },
  headerTitulo: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  avatarSection: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarLetra: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  avatarImagen: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
  },
  nombreTexto: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  rolTexto: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  datosCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  datoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  datoLabel: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  datoValor: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
    maxWidth: "60%",
    textAlign: "right",
  },
  datoValorDestacado: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  separador: {
    height: 1,
    backgroundColor: Colors.azulClaro,
  },
  seccion: { gap: 10 },
  seccionTitulo: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
  },
  sinHistorialTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    paddingVertical: 16,
  },
  historialCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  historialItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  historialSemana: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeCompletada: { backgroundColor: Colors.verdeClaro },
  badgeActiva: { backgroundColor: Colors.azulClaro },
  badgePendiente: { backgroundColor: "#FFF3E0" },
  badgeTexto: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  badgeCompletadaTexto: { color: Colors.verdePrincipal },
  badgeActivaTexto: { color: Colors.azulPrincipal },
  badgePendienteTexto: { color: Colors.naranjaAlerta },
  opcionesCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  opcionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  opcionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  opcionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionTexto: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
});
