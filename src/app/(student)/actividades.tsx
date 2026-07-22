import LoadingScreen from "@/src/components/ui/LoadingScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { obtenerTodasLasActividades } from "../../service/actividades.service";
import { useAuthStore } from "../../store/authStore";

type EstadoActividad =
  | "completada"
  | "pendiente"
  | "activa_sin_hacer"
  | "futura";

interface ActividadConEstado {
  id: string;
  numero_semana: number;
  anio: number;
  fecha_publicacion: string;
  fecha_cierre: string;
  estado: string;
  completada: boolean;
  respuestasCount: number;
}

function obtenerEstadoActividad(
  actividad: ActividadConEstado,
): EstadoActividad {
  if (actividad.completada) return "completada";
  if (actividad.estado === "activa") return "activa_sin_hacer";
  // Si está cerrada y no fue completada
  if (actividad.estado === "cerrada") {
    const ahora = new Date();
    const cierre = new Date(actividad.fecha_cierre);
    // Si ya pasó la fecha de cierre es pasada sin completar
    if (cierre < ahora) return "pendiente";
    // Si no ha llegado la fecha de publicación es futura
    return "futura";
  }
  return "futura";
}

function formatearFecha(fechaStr: string): string {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BadgeEstado({ estado }: { estado: EstadoActividad }) {
  const config = {
    completada: {
      texto: "Completada",
      color: Colors.verdePrincipal,
      fondo: Colors.verdeClaro,
      icono: "check-circle-outline" as const,
    },
    activa_sin_hacer: {
      texto: "Pendiente por realizar",
      color: Colors.azulPrincipal,
      fondo: Colors.azulClaro,
      icono: "clock-outline" as const,
    },
    pendiente: {
      texto: "No realizada",
      color: Colors.naranjaAlerta,
      fondo: "#FFF3E0",
      icono: "alert-circle-outline" as const,
    },
    futura: {
      texto: "Próximamente",
      color: Colors.grisMedio,
      fondo: "#F0F0F0",
      icono: "lock-outline" as const,
    },
  };

  const { texto, color, fondo, icono } = config[estado];

  return (
    <View style={[styles.badge, { backgroundColor: fondo }]}>
      <MaterialCommunityIcons name={icono} size={13} color={color} />
      <Text style={[styles.badgeText, { color }]}>{texto}</Text>
    </View>
  );
}

export default function ActividadesScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [actividades, setActividades] = useState<ActividadConEstado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarActividades();
    }, [session]),
  );

  async function cargarActividades() {
    setIsLoading(true);
    try {
      const data = await obtenerTodasLasActividades(session!.user.id);
      setActividades(data as ActividadConEstado[]);
    } catch (error) {
      console.log("Error cargando actividades:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePresionarActividad(actividad: ActividadConEstado) {
    const estado = obtenerEstadoActividad(actividad);
    if (estado === "activa_sin_hacer") {
      router.push("/(student)/actividad");
    }
    // Para completada, futura y pendiente no hace nada
  }

  if (isLoading) return <LoadingScreen mensaje="Cargando tus actividades..." />;

  const completadas = actividades.filter((a) => a.completada).length;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Actividades</Text>
        <Text style={styles.subtitulo}>
          {completadas} de {actividades.length} completadas
        </Text>
      </View>

      {/* BARRA DE PROGRESO GENERAL */}
      <View style={styles.progresoContainer}>
        <View style={styles.progresoBar}>
          <View
            style={[
              styles.progresoFill,
              { width: `${(completadas / actividades.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progresoTexto}>
          {Math.round((completadas / actividades.length) * 100)}% del programa
          completado
        </Text>
      </View>

      {/* LISTA DE ACTIVIDADES */}
      <View style={styles.listaContainer}>
        {actividades.map((actividad) => {
          const estado = obtenerEstadoActividad(actividad);
          const esTocable = estado === "activa_sin_hacer";

          return (
            <TouchableOpacity
              key={actividad.id}
              style={[
                styles.actividadCard,
                estado === "activa_sin_hacer" && styles.actividadCardActiva,
                estado === "completada" && styles.actividadCardCompletada,
                (estado === "futura" || estado === "pendiente") &&
                  styles.actividadCardInactiva,
              ]}
              onPress={() => handlePresionarActividad(actividad)}
              activeOpacity={esTocable ? 0.7 : 1}
            >
              {/* NÚMERO DE SEMANA */}
              <View
                style={[
                  styles.semanaCircle,
                  estado === "completada" && styles.semanaCircleCompletada,
                  estado === "activa_sin_hacer" && styles.semanaCircleActiva,
                  (estado === "futura" || estado === "pendiente") &&
                    styles.semanaCircleInactiva,
                ]}
              >
                {estado === "completada" ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={Colors.blanco}
                  />
                ) : (
                  <Text
                    style={[
                      styles.semanaNumero,
                      estado === "activa_sin_hacer" &&
                        styles.semanaNumeroActiva,
                    ]}
                  >
                    {actividad.numero_semana}
                  </Text>
                )}
              </View>

              {/* CONTENIDO */}
              <View style={styles.actividadContent}>
                <Text
                  style={[
                    styles.actividadTitulo,
                    (estado === "futura" || estado === "pendiente") &&
                      styles.textoInactivo,
                  ]}
                >
                  Semana {actividad.numero_semana}
                </Text>

                {estado === "futura" && (
                  <Text style={styles.actividadFecha}>
                    Disponible el {formatearFecha(actividad.fecha_publicacion)}
                  </Text>
                )}

                {estado === "activa_sin_hacer" && (
                  <Text style={styles.actividadFechaActiva}>
                    Cierra el {formatearFecha(actividad.fecha_cierre)}
                  </Text>
                )}

                {estado === "completada" && (
                  <Text style={styles.actividadFechaCompletada}>
                    10 / 10 situaciones respondidas
                  </Text>
                )}

                {estado === "pendiente" && (
                  <Text style={styles.actividadFecha}>
                    Cerró el {formatearFecha(actividad.fecha_cierre)}
                  </Text>
                )}

                <BadgeEstado estado={estado} />
              </View>

              {/* FLECHA SOLO SI ES TOCABLE */}
              {esTocable && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Colors.azulPrincipal}
                />
              )}
            </TouchableOpacity>
          );
        })}
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
    gap: 4,
  },
  titulo: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  progresoContainer: {
    gap: 8,
  },
  progresoBar: {
    height: 8,
    backgroundColor: Colors.azulClaro,
    borderRadius: 4,
  },
  progresoFill: {
    height: 8,
    backgroundColor: Colors.azulPrincipal,
    borderRadius: 4,
  },
  progresoTexto: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  listaContainer: {
    gap: 12,
  },
  actividadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.azulClaro,
    elevation: 1,
  },
  actividadCardActiva: {
    borderColor: Colors.azulPrincipal,
    elevation: 3,
    shadowColor: Colors.azulPrincipal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actividadCardCompletada: {
    borderColor: Colors.verdePrincipal,
  },
  actividadCardInactiva: {
    opacity: 0.7,
  },
  semanaCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.azulClaro,
  },
  semanaCircleActiva: {
    backgroundColor: Colors.azulPrincipal,
  },
  semanaCircleCompletada: {
    backgroundColor: Colors.verdePrincipal,
  },
  semanaCircleInactiva: {
    backgroundColor: "#E8E8E8",
  },
  semanaNumero: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
  },
  semanaNumeroActiva: {
    color: Colors.blanco,
  },
  actividadContent: {
    flex: 1,
    gap: 4,
  },
  actividadTitulo: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  textoInactivo: {
    color: Colors.grisMedio,
  },
  actividadFecha: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  actividadFechaActiva: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.azulPrincipal,
  },
  actividadFechaCompletada: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.verdePrincipal,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
});
