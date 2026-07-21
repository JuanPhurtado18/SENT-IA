import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { cerrarSesion, obtenerPerfil } from "../../service/auth.service";
import { obtenerEstadisticasDocente } from "../../service/docente.service";
import { useAuthStore } from "../../store/authStore";

// Datos de prueba hardcodeados para alertas y indicadores
// Se reemplazarán cuando el módulo de IA esté listo
const ALERTAS_PRUEBA = [
  {
    id: "1",
    tipo: "prioritaria",
    nombre: "Juan Pérez",
    descripcion: "3 semanas consecutivas con indicadores críticos",
    color: Colors.rojoAlerta,
    fondo: "#FFEBEB",
    icono: "alert-circle" as const,
  },
  {
    id: "2",
    tipo: "seguimiento",
    nombre: "María García",
    descripcion: "Área familiar · Semana 2",
    color: Colors.naranjaAlerta,
    fondo: "#FFF3E0",
    icono: "alert" as const,
  },
];

const INDICADORES_PRUEBA = [
  {
    area: "Área escolar",
    nivel: "Estable",
    color: Colors.verdePrincipal,
    progreso: 0.85,
  },
  {
    area: "Área familiar",
    nivel: "Observación",
    color: Colors.naranjaAlerta,
    progreso: 0.55,
  },
  {
    area: "Área personal",
    nivel: "Estable",
    color: Colors.verdePrincipal,
    progreso: 0.78,
  },
  {
    area: "Área social",
    nivel: "Seguimiento",
    color: Colors.rojoAlerta,
    progreso: 0.35,
  },
  {
    area: "Área afectiva",
    nivel: "Estable",
    color: Colors.verdePrincipal,
    progreso: 0.8,
  },
];

const NIVEL_COLORS: Record<string, string> = {
  Estable: Colors.verdePrincipal,
  Observación: Colors.naranjaAlerta,
  Seguimiento: Colors.rojoAlerta,
  Prioritario: Colors.rojoAlerta,
};

const NIVEL_FONDOS: Record<string, string> = {
  Estable: Colors.verdeClaro,
  Observación: "#FFF3E0",
  Seguimiento: "#FFEBEB",
  Prioritario: "#FFEBEB",
};

export default function TeacherDashboard() {
  const { session } = useAuthStore();
  const [perfil, setPerfil] = useState<any>(null);
  const [estadisticas, setEstadisticas] = useState({
    totalEstudiantes: 0,
    totalAlertas: 0,
    activosEstaSemana: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarDatos();
    }, [session]),
  );

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const perfilData = await obtenerPerfil(session!.user.id);
      setPerfil(perfilData);

      const stats = await obtenerEstadisticasDocente();
      setEstadisticas(stats);
    } catch (error) {
      console.log("Error cargando dashboard docente:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCerrarSesion() {
    try {
      await cerrarSesion();
    } catch (error: any) {
      console.log("Error cerrando sesión:", error);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
      </View>
    );
  }

  if (!session?.user) return null;

  const inicialNombre = perfil?.nombre_completo?.[0]?.toUpperCase() || "D";
  const primerNombre = perfil?.nombre_completo?.split(" ")[0] || "Docente";

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Panel docente</Text>
          <Text style={styles.headerNombre}>Prof. {primerNombre}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleCerrarSesion}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="logout"
              size={18}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetra}>{inicialNombre}</Text>
          </View>
        </View>
      </View>

      {/* TARJETAS DE MÉTRICAS */}
      <View style={styles.metricasContainer}>
        <View style={styles.metricaCard}>
          <Text style={styles.metricaNumero}>
            {estadisticas.totalEstudiantes}
          </Text>
          <Text style={styles.metricaLabel}>Estudiantes</Text>
        </View>
        <View style={[styles.metricaCard, styles.metricaCardAlerta]}>
          <Text style={[styles.metricaNumero, { color: Colors.rojoAlerta }]}>
            {estadisticas.totalAlertas}
          </Text>
          <Text style={styles.metricaLabel}>Alertas</Text>
        </View>
        <View style={styles.metricaCard}>
          <Text
            style={[styles.metricaNumero, { color: Colors.verdePrincipal }]}
          >
            {estadisticas.activosEstaSemana}
          </Text>
          <Text style={styles.metricaLabel}>Activos</Text>
        </View>
      </View>

      {/* ALERTAS RECIENTES */}
      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color={Colors.grisOscuro}
          />
          <Text style={styles.seccionTitulo}>ALERTAS RECIENTES</Text>
        </View>

        {ALERTAS_PRUEBA.length === 0 ? (
          <View style={styles.sinDatosCard}>
            <Text style={styles.sinDatosTexto}>No hay alertas activas</Text>
          </View>
        ) : (
          ALERTAS_PRUEBA.map((alerta) => (
            <View
              key={alerta.id}
              style={[
                styles.alertaCard,
                {
                  backgroundColor: alerta.fondo,
                  borderLeftColor: alerta.color,
                },
              ]}
            >
              <View style={styles.alertaHeader}>
                <MaterialCommunityIcons
                  name={alerta.icono}
                  size={16}
                  color={alerta.color}
                />
                <Text style={[styles.alertaTipo, { color: alerta.color }]}>
                  {alerta.tipo === "prioritaria"
                    ? "Atención prioritaria"
                    : "Seguimiento"}
                </Text>
              </View>
              <Text style={styles.alertaNombre}>{alerta.nombre}</Text>
              <Text style={styles.alertaDescripcion}>{alerta.descripcion}</Text>
            </View>
          ))
        )}
      </View>

      {/* INDICADORES DEL GRUPO */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>INDICADORES DEL GRUPO</Text>
        <View style={styles.indicadoresCard}>
          {INDICADORES_PRUEBA.map((indicador, index) => (
            <View key={indicador.area}>
              <View style={styles.indicadorItem}>
                <Text style={styles.indicadorArea}>{indicador.area}</Text>
                <View style={styles.indicadorBarraContainer}>
                  <View style={styles.indicadorBarra}>
                    <View
                      style={[
                        styles.indicadorBarraFill,
                        {
                          width: `${indicador.progreso * 100}%`,
                          backgroundColor: indicador.color,
                        },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.nivelBadge,
                      { backgroundColor: NIVEL_FONDOS[indicador.nivel] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.nivelBadgeTexto,
                        { color: NIVEL_COLORS[indicador.nivel] },
                      ]}
                    >
                      {indicador.nivel}
                    </Text>
                  </View>
                </View>
              </View>
              {index < INDICADORES_PRUEBA.length - 1 && (
                <View style={styles.separador} />
              )}
            </View>
          ))}
        </View>
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
  headerLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  headerNombre: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
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
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lilaAcento,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  metricasContainer: {
    flexDirection: "row",
    gap: 12,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  metricaCardAlerta: {
    borderColor: "#FFEBEB",
  },
  metricaNumero: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
  },
  metricaLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  seccion: { gap: 12 },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seccionTitulo: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
  },
  sinDatosCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  sinDatosTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  alertaCard: {
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    gap: 4,
  },
  alertaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertaTipo: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  alertaNombre: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  alertaDescripcion: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  indicadoresCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  indicadorItem: {
    paddingVertical: 14,
    gap: 8,
  },
  indicadorArea: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  indicadorBarraContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  indicadorBarra: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.azulClaro,
    borderRadius: 3,
  },
  indicadorBarraFill: {
    height: 6,
    borderRadius: 3,
  },
  nivelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  nivelBadgeTexto: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  separador: {
    height: 1,
    backgroundColor: Colors.azulClaro,
  },
});
