import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import LoadingScreen from "@/src/components/ui/LoadingScreen";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  contarRespuestasDeActividad,
  obtenerActividadActiva,
  obtenerHistorialActividades,
} from "../../service/actividades.service";
import {
  cerrarSesion,
  obtenerEstadoEmocionalHoy,
  obtenerPerfil,
  registrarEstadoEmocional,
} from "../../service/auth.service";
import { useAuthStore } from "../../store/authStore";

const EMOCIONES = [
  { valor: 1, emoji: "😄", etiqueta: "Muy bien" },
  { valor: 2, emoji: "🙂", etiqueta: "Bien" },
  { valor: 3, emoji: "😐", etiqueta: "Regular" },
  { valor: 4, emoji: "😕", etiqueta: "Mal" },
  { valor: 5, emoji: "😢", etiqueta: "Muy mal" },
];

export default function StudentHomeScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [perfil, setPerfil] = useState<any>(null);
  const [actividadActiva, setActividadActiva] = useState<any>(null);
  const [respuestasCompletadas, setRespuestasCompletadas] = useState(0);
  const [historial, setHistorial] = useState<any[]>([]);
  const [estadoEmocional, setEstadoEmocional] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarDatos();
    }, [session]),
  );

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const [perfilData, actividad, estadoHoy, historialData] =
        await Promise.all([
          obtenerPerfil(session!.user.id),
          obtenerActividadActiva(),
          obtenerEstadoEmocionalHoy(session!.user.id),
          obtenerHistorialActividades(session!.user.id),
        ]);

      setPerfil(perfilData);
      setActividadActiva(actividad);
      setEstadoEmocional(estadoHoy);
      setHistorial(historialData);

      if (actividad) {
        const count = await contarRespuestasDeActividad(
          session!.user.id,
          actividad.id,
        );
        setRespuestasCompletadas(count);
      }
    } catch (error) {
      console.log("Error cargando datos del inicio:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEstadoEmocional(valor: number) {
    setEstadoEmocional(valor);
    try {
      await registrarEstadoEmocional(session!.user.id, valor);
    } catch (error) {
      console.log("Error registrando estado emocional:", error);
    }
  }

  function obtenerSaludo() {
    // Colombia es UTC-5, sin cambio de horario de verano
    const offsetColombia = -5 * 60; // en minutos
    const ahora = new Date();
    const utcMinutos = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
    const horaColombia = new Date(utcMinutos + offsetColombia * 60000);
    const hora = horaColombia.getHours();

    console.log("Hora Colombia:", hora); // log temporal para verificar

    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  }

  function diasRestantes() {
    if (!actividadActiva) return 0;
    const cierre = new Date(actividadActiva.fecha_cierre);
    const hoy = new Date();
    const diff = Math.ceil(
      (cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }

  if (isLoading) return <LoadingScreen mensaje="Cargando tu inicio..." />;

  const progresoActividad = respuestasCompletadas / 10;
  const actividadCompletada = respuestasCompletadas >= 10;

  async function handleCerrarSesion() {
    try {
      await cerrarSesion();
    } catch (error: any) {
      console.log("Error cerrando sesión:", error);
    }
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saludoText}>{obtenerSaludo()} 👋</Text>
          <Text style={styles.nombreText}>
            Hola, {perfil?.nombre_completo?.split(" ")[0] || "Estudiante"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleCerrarSesion}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetra}>
              {perfil?.nombre_completo?.[0]?.toUpperCase() || "E"}
            </Text>
          </View>
        </View>
      </View>

      {/* TARJETA ACTIVIDAD SEMANAL */}
      {actividadActiva ? (
        <View style={styles.actividadCard}>
          <Text style={styles.actividadLabel}>ACTIVIDAD SEMANAL</Text>
          <Text style={styles.actividadTitulo}>
            Semana {actividadActiva.numero_semana} —{" "}
            {actividadCompletada ? "Completada ✓" : "En curso"}
          </Text>
          <Text style={styles.actividadSubtitulo}>
            {actividadCompletada
              ? "¡Completaste todas las situaciones!"
              : `${respuestasCompletadas} de 10 situaciones`}
          </Text>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progresoActividad * 100}%` },
              ]}
            />
          </View>

          {!actividadCompletada && (
            <Text style={styles.diasRestantes}>
              {diasRestantes()} días restantes
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.actividadButton,
              actividadCompletada && styles.actividadButtonDisabled,
            ]}
            onPress={() => router.push("/(student)/actividad")}
            disabled={actividadCompletada}
            activeOpacity={0.8}
          >
            <Text style={styles.actividadButtonText}>
              {actividadCompletada
                ? "Actividad completada"
                : respuestasCompletadas > 0
                  ? "Continuar actividad →"
                  : "Iniciar actividad →"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sinActividadCard}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={32}
            color={Colors.grisMedio}
          />
          <Text style={styles.sinActividadText}>
            No hay actividad disponible por ahora.{"\n"}Vuelve pronto.
          </Text>
        </View>
      )}

      {/* ESTADO EMOCIONAL */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>¿Cómo te sientes hoy?</Text>
        <View style={styles.emocionesContainer}>
          {EMOCIONES.map((emocion) => (
            <TouchableOpacity
              key={emocion.valor}
              style={[
                styles.emocionButton,
                estadoEmocional === emocion.valor &&
                  styles.emocionButtonSelected,
              ]}
              onPress={() => handleEstadoEmocional(emocion.valor)}
              activeOpacity={0.7}
            >
              <Text style={styles.emocionEmoji}>{emocion.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.emocionesEtiquetas}>
          <Text style={styles.emocionEtiqueta}>Muy bien</Text>
          <Text style={styles.emocionEtiqueta}>Muy mal</Text>
        </View>
      </View>

      {/* HISTORIAL RECIENTE */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Historial reciente</Text>
        {historial.length === 0 ? (
          <Text style={styles.sinHistorialText}>
            Aún no has completado ninguna actividad.
          </Text>
        ) : (
          historial.map((item) => (
            <View key={item.id} style={styles.historialItem}>
              <Text style={styles.historialSemana}>
                Semana {item.numero_semana}
              </Text>
              <View
                style={[
                  styles.historialBadge,
                  item.totalRespuestas >= 10
                    ? styles.badgeCompletada
                    : styles.badgePendiente,
                ]}
              >
                <Text
                  style={[
                    styles.historialBadgeText,
                    item.totalRespuestas >= 10
                      ? styles.badgeCompletadaText
                      : styles.badgePendienteText,
                  ]}
                >
                  {item.totalRespuestas >= 10
                    ? "Completada"
                    : item.estado === "activa"
                      ? "Por realizar"
                      : "Incompleta"}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blanco,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  saludoText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  nombreText: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  actividadCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    gap: 8,
  },
  actividadLabel: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
    letterSpacing: 1,
  },
  actividadTitulo: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  actividadSubtitulo: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.azulClaro,
    borderRadius: 3,
    marginVertical: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.azulPrincipal,
    borderRadius: 3,
  },
  diasRestantes: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  actividadButton: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 4,
    elevation: 2,
  },
  actividadButtonDisabled: {
    backgroundColor: Colors.verdePrincipal,
  },
  actividadButtonText: {
    color: Colors.blanco,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  sinActividadCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  sinActividadText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  seccion: {
    gap: 12,
  },
  seccionTitulo: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  emocionesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  emocionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.fondoApp,
  },
  emocionButtonSelected: {
    backgroundColor: Colors.azulClaro,
    transform: [{ scale: 1.15 }],
  },
  emocionEmoji: {
    fontSize: 28,
  },
  emocionesEtiquetas: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  emocionEtiqueta: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  historialItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 1,
  },
  historialSemana: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  historialBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCompletada: {
    backgroundColor: Colors.verdeClaro,
  },
  badgePendiente: {
    backgroundColor: "#FFF3E0",
  },
  historialBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  badgeCompletadaText: {
    color: Colors.verdePrincipal,
  },
  badgePendienteText: {
    color: Colors.naranjaAlerta,
  },
  sinHistorialText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    paddingVertical: 16,
  },
});
