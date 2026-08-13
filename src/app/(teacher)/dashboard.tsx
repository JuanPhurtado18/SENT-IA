import LoadingScreen from "@/src/components/ui/LoadingScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { cerrarSesion, obtenerPerfil } from "../../service/auth.service";
import {
  obtenerAlertasRecientes,
  obtenerEstadisticasDocente,
  obtenerIndicadoresGrupoDashboard,
} from "../../service/docente.service";
import { useAuthStore } from "../../store/authStore";

const NIVEL_COLORS: Record<string, string> = {
  estable: Colors.verdePrincipal,
  observacion: Colors.naranjaAlerta,
  seguimiento: Colors.rojoAlerta,
  prioritario: Colors.rojoAlerta,
};

export default function TeacherDashboard() {
  const { session } = useAuthStore();
  const [perfil, setPerfil] = useState<any>(null);
  const [estadisticas, setEstadisticas] = useState({
    totalEstudiantes: 0,
    totalAlertas: 0,
    activosEstaSemana: 0,
  });
  const [alertasRecientes, setAlertasRecientes] = useState<any[]>([]);
  const [indicadoresGrupo, setIndicadoresGrupo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarDatos();
    }, [session]),
  );

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const [perfilData, stats, alertas, indicadores] = await Promise.all([
        obtenerPerfil(session!.user.id),
        obtenerEstadisticasDocente(),
        obtenerAlertasRecientes(),
        obtenerIndicadoresGrupoDashboard(),
      ]);
      setPerfil(perfilData);
      setEstadisticas(stats);
      setAlertasRecientes(alertas);
      setIndicadoresGrupo(indicadores);
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

  if (isLoading) return <LoadingScreen mensaje="Cargando tu inicio..." />;
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
        {alertasRecientes.length === 0 ? (
          <View style={styles.sinDatosCard}>
            <Text style={styles.sinDatosTexto}>No hay alertas activas</Text>
          </View>
        ) : (
          alertasRecientes.map((alerta) => {
            const config = {
              prioritaria: {
                color: Colors.rojoAlerta,
                fondo: "#FFEBEB",
                icono: "alert-circle",
                label: "Prioritaria",
              },
              seguimiento: {
                color: Colors.naranjaAlerta,
                fondo: "#FFF3E0",
                icono: "alert",
                label: "Seguimiento",
              },
              bienestar_general: {
                color: Colors.rojoAlerta,
                fondo: "#FFEBEB",
                icono: "heart-broken",
                label: "Bienestar",
              },
              inactividad: {
                color: Colors.naranjaAlerta,
                fondo: "#FFF3E0",
                icono: "clock-alert-outline",
                label: "Inactividad",
              },
            }[alerta.tipo as string] ?? {
              color: Colors.grisMedio,
              fondo: "#F0F0F0",
              icono: "alert",
              label: alerta.tipo,
            };

            return (
              <View
                key={alerta.id}
                style={[
                  styles.alertaCard,
                  {
                    backgroundColor: config.fondo,
                    borderLeftColor: config.color,
                  },
                ]}
              >
                <View style={styles.alertaHeader}>
                  <MaterialCommunityIcons
                    name={config.icono as any}
                    size={16}
                    color={config.color}
                  />
                  <Text style={[styles.alertaTipo, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
                <Text style={styles.alertaNombre}>
                  {alerta.nombreEstudiante}
                </Text>
                <Text style={styles.alertaDescripcion}>
                  {alerta.descripcion}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* INDICADORES DEL GRUPO */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>INDICADORES DEL GRUPO</Text>
        {indicadoresGrupo.length === 0 ? (
          <View style={styles.sinDatosCard}>
            <Text style={styles.sinDatosTexto}>
              Los indicadores aparecerán cuando los estudiantes completen
              actividades.
            </Text>
          </View>
        ) : (
          <View style={styles.indicadoresCard}>
            {indicadoresGrupo.map((ind, index) => {
              const color = NIVEL_COLORS[ind.nivel] ?? Colors.grisMedio;
              const progreso = ind.esConteo
                ? ind.total > 0
                  ? ind.puntuacion / ind.total
                  : 0
                : ind.puntuacion / 100;

              return (
                <View key={ind.area}>
                  <View style={styles.indicadorItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.indicadorArea}>{ind.area}</Text>
                      <Text style={[styles.indicadorValor, { color }]}>
                        {ind.esConteo
                          ? `${ind.puntuacion}/${ind.total}`
                          : `${ind.puntuacion}/100`}
                      </Text>
                    </View>
                    <View style={styles.indicadorBarraContainer}>
                      <View style={styles.indicadorBarra}>
                        <View
                          style={[
                            styles.indicadorBarraFill,
                            {
                              width: `${progreso * 100}%`,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  {index < indicadoresGrupo.length - 1 && (
                    <View style={styles.separador} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    textAlign: "center",
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
  indicadorValor: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  indicadorBarraContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  separador: {
    height: 1,
    backgroundColor: Colors.azulClaro,
  },
});
