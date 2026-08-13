import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  marcarAlertaRevisada,
  obtenerAlertas,
  reactivarAlerta,
} from "../../service/alertas.service";
import { useAuthStore } from "../../store/authStore";

type NivelAlerta =
  | "prioritaria"
  | "seguimiento"
  | "inactividad"
  | "bienestar_general";
type EstadoAlerta = "activa" | "revisada";

interface AlertaItem {
  id: string;
  tipo: NivelAlerta;
  nombreEstudiante: string;
  descripcion: string;
  fecha: string;
  estado: EstadoAlerta;
}

const TIPO_CONFIG: Record<
  NivelAlerta,
  { label: string; color: string; fondo: string; icono: string }
> = {
  prioritaria: {
    label: "Atención prioritaria",
    color: Colors.rojoAlerta,
    fondo: "#FFEBEB",
    icono: "alert-circle",
  },
  seguimiento: {
    label: "Seguimiento",
    color: Colors.naranjaAlerta,
    fondo: "#FFF3E0",
    icono: "alert",
  },
  inactividad: {
    label: "Inactividad",
    color: Colors.naranjaAlerta,
    fondo: "#FFF3E0",
    icono: "clock-alert-outline",
  },
  bienestar_general: {
    label: "Bienestar general",
    color: Colors.rojoAlerta,
    fondo: "#FFEBEB",
    icono: "heart-broken",
  },
};

type FiltroTipo = "todas" | "activas" | "revisadas";

export default function AlertasScreen() {
  const { session } = useAuthStore();
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [filtro, setFiltro] = useState<FiltroTipo>("activas");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
  }, []);

  async function cargarAlertas() {
    setIsLoading(true);
    try {
      const data = await obtenerAlertas();
      setAlertas(data);
    } catch (error) {
      console.log("Error cargando alertas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarcarRevisada(id: string) {
    Alert.alert(
      "Marcar como revisada",
      "¿Confirmas que revisaste esta alerta? Saldrá de la vista principal pero quedará en el historial.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Marcar revisada",
          onPress: async () => {
            try {
              await marcarAlertaRevisada(id, session!.user.id);
              setAlertas((prev) =>
                prev.map((a) =>
                  a.id === id ? { ...a, estado: "revisada" } : a,
                ),
              );
            } catch {
              Alert.alert("Error", "No se pudo marcar la alerta.");
            }
          },
        },
      ],
    );
  }

  async function handleReactivar(id: string) {
    Alert.alert(
      "Reactivar alerta",
      "¿Quieres mover esta alerta de vuelta a activas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reactivar",
          onPress: async () => {
            try {
              await reactivarAlerta(id);
              setAlertas((prev) =>
                prev.map((a) => (a.id === id ? { ...a, estado: "activa" } : a)),
              );
            } catch {
              Alert.alert("Error", "No se pudo reactivar la alerta.");
            }
          },
        },
      ],
    );
  }

  const alertasFiltradas = alertas.filter((a) => {
    if (filtro === "activas") return a.estado === "activa";
    if (filtro === "revisadas") return a.estado === "revisada";
    return true;
  });

  const totalActivas = alertas.filter((a) => a.estado === "activa").length;
  const totalRevisadas = alertas.filter((a) => a.estado === "revisada").length;

  if (isLoading) {
    return (
      <View
        style={[
          styles.wrapper,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Alertas</Text>
        <View style={styles.contadoresRow}>
          <View style={styles.contadorItem}>
            <View
              style={[styles.contadorCircle, { backgroundColor: "#FFEBEB" }]}
            >
              <Text
                style={[styles.contadorNumero, { color: Colors.rojoAlerta }]}
              >
                {totalActivas}
              </Text>
            </View>
            <Text style={styles.contadorLabel}>Activas</Text>
          </View>
          <View style={styles.contadorItem}>
            <View
              style={[
                styles.contadorCircle,
                { backgroundColor: Colors.verdeClaro },
              ]}
            >
              <Text
                style={[
                  styles.contadorNumero,
                  { color: Colors.verdePrincipal },
                ]}
              >
                {totalRevisadas}
              </Text>
            </View>
            <Text style={styles.contadorLabel}>Revisadas</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        {(["activas", "todas", "revisadas"] as FiltroTipo[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroChip, filtro === f && styles.filtroChipActivo]}
            onPress={() => setFiltro(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === f && styles.filtroTextoActivo,
              ]}
            >
              {f === "activas"
                ? "Activas"
                : f === "todas"
                  ? "Todas"
                  : "Revisadas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      >
        {alertasFiltradas.length === 0 ? (
          <View style={styles.sinAlertas}>
            <MaterialCommunityIcons
              name="bell-check-outline"
              size={56}
              color={Colors.azulClaro}
            />
            <Text style={styles.sinAlertasTexto}>
              {filtro === "activas"
                ? "No hay alertas activas en este momento"
                : filtro === "revisadas"
                  ? "No hay alertas revisadas todavía"
                  : "No hay alertas registradas"}
            </Text>
          </View>
        ) : (
          alertasFiltradas.map((alerta) => {
            const config = TIPO_CONFIG[alerta.tipo];
            const esRevisada = alerta.estado === "revisada";

            return (
              <View
                key={alerta.id}
                style={[
                  styles.alertaCard,
                  { borderLeftColor: config.color },
                  esRevisada && styles.alertaCardRevisada,
                ]}
              >
                <View style={styles.alertaTopRow}>
                  <View
                    style={[
                      styles.tipoBadge,
                      { backgroundColor: config.fondo },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={config.icono as any}
                      size={13}
                      color={config.color}
                    />
                    <Text style={[styles.tipoTexto, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                  <Text style={styles.alertaFecha}>{alerta.fecha}</Text>
                </View>

                <Text
                  style={[
                    styles.alertaNombre,
                    esRevisada && styles.textoRevisado,
                  ]}
                >
                  {alerta.nombreEstudiante}
                </Text>
                <Text style={styles.alertaDescripcion}>
                  {alerta.descripcion}
                </Text>

                <View style={styles.alertaBottomRow}>
                  {esRevisada ? (
                    <View style={styles.revisadaRow}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color={Colors.verdePrincipal}
                      />
                      <Text style={styles.revisadaTexto}>Revisada</Text>
                      <TouchableOpacity
                        onPress={() => handleReactivar(alerta.id)}
                        style={styles.reactivarButton}
                      >
                        <Text style={styles.reactivarTexto}>Reactivar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.revisarButton}
                      onPress={() => handleMarcarRevisada(alerta.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color={Colors.azulPrincipal}
                      />
                      <Text style={styles.revisarButtonTexto}>
                        Marcar revisada
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.fondoApp, paddingTop: 56 },
  header: { paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  titulo: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  contadoresRow: { flexDirection: "row", gap: 12 },
  contadorItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  contadorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contadorNumero: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  contadorLabel: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  filtrosContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.blanco,
    borderWidth: 1.5,
    borderColor: Colors.azulClaro,
  },
  filtroChipActivo: {
    backgroundColor: Colors.azulPrincipal,
    borderColor: Colors.azulPrincipal,
  },
  filtroTexto: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisMedio,
  },
  filtroTextoActivo: { color: Colors.blanco },
  scrollView: { flex: 1 },
  listaContainer: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  sinAlertas: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
    paddingHorizontal: 32,
  },
  sinAlertasTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  alertaCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    elevation: 1,
    gap: 8,
  },
  alertaCardRevisada: { opacity: 0.7 },
  alertaTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoTexto: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  alertaFecha: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  alertaNombre: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  textoRevisado: { color: Colors.grisMedio },
  alertaDescripcion: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    lineHeight: 20,
  },
  alertaBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  revisarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.azulPrincipal,
  },
  revisarButtonTexto: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  revisadaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  revisadaTexto: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.verdePrincipal,
  },
  reactivarButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.azulClaro,
  },
  reactivarTexto: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
});
