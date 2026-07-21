import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { obtenerTodosLosEstudiantes } from "../../service/docente.service";
import { useAuthStore } from "../../store/authStore";

type FiltroTipo = "todos" | "alerta" | "seguimiento";

const ESTADO_SEMANA_CONFIG: Record<
  string,
  { texto: string; color: string; fondo: string }
> = {
  completada: {
    texto: "Completada",
    color: Colors.verdePrincipal,
    fondo: Colors.verdeClaro,
  },
  en_progreso: {
    texto: "En progreso",
    color: Colors.azulPrincipal,
    fondo: Colors.azulClaro,
  },
  pendiente: { texto: "Pendiente", color: Colors.grisMedio, fondo: "#F0F0F0" },
  sin_actividad: {
    texto: "Sin actividad",
    color: Colors.grisMedio,
    fondo: "#F0F0F0",
  },
};

const ALERTA_CONFIG: Record<string, { color: string; texto: string }> = {
  prioritaria: { color: Colors.rojoAlerta, texto: "Prioritario" },
  seguimiento: { color: Colors.naranjaAlerta, texto: "Seguimiento" },
  inactividad: { color: Colors.naranjaAlerta, texto: "Inactividad" },
  bienestar_general: { color: Colors.naranjaAlerta, texto: "Bienestar" },
};

export default function EstudiantesScreen() {
  const { session } = useAuthStore();
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) cargarEstudiantes();
    }, [session]),
  );

  async function cargarEstudiantes() {
    setIsLoading(true);
    try {
      const data = await obtenerTodosLosEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      console.log("Error cargando estudiantes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtra por búsqueda y por filtro activo
  const estudiantesFiltrados = estudiantes.filter((e) => {
    const coincideBusqueda =
      e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.institucion?.toLowerCase().includes(busqueda.toLowerCase());

    if (filtro === "alerta") {
      return coincideBusqueda && e.nivelAlerta === "prioritaria";
    }
    if (filtro === "seguimiento") {
      return coincideBusqueda && e.nivelAlerta === "seguimiento";
    }
    return coincideBusqueda;
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
      </View>
    );
  }

  if (!session?.user) return null;

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis estudiantes</Text>
        <Text style={styles.subtitulo}>{estudiantes.length} total</Text>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={Colors.grisMedio}
        />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar estudiante..."
          placeholderTextColor={Colors.grisMedio}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosContainer}>
        {(["todos", "alerta", "seguimiento"] as FiltroTipo[]).map((f) => (
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
              {f === "todos"
                ? "Todos"
                : f === "alerta"
                  ? "Con alerta"
                  : "Seguimiento"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      >
        {estudiantesFiltrados.length === 0 ? (
          <View style={styles.sinResultadosContainer}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={48}
              color={Colors.grisMedio}
            />
            <Text style={styles.sinResultadosTexto}>
              {busqueda.length > 0
                ? `No se encontraron estudiantes con "${busqueda}"`
                : "No hay estudiantes en esta categoría"}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.listaLabel}>
              LISTADO · {estudiantesFiltrados.length} estudiantes
            </Text>
            {estudiantesFiltrados.map((estudiante) => {
              const estadoConfig =
                ESTADO_SEMANA_CONFIG[estudiante.estadoSemana];
              const alertaConfig = estudiante.nivelAlerta
                ? ALERTA_CONFIG[estudiante.nivelAlerta]
                : null;

              return (
                <TouchableOpacity
                  key={estudiante.id}
                  style={[
                    styles.estudianteCard,
                    alertaConfig && { borderLeftColor: alertaConfig.color },
                  ]}
                  activeOpacity={0.7}
                >
                  {/* AVATAR */}
                  {estudiante.foto_url ? (
                    <Image
                      source={{ uri: estudiante.foto_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarCircle,
                        alertaConfig && { backgroundColor: alertaConfig.color },
                      ]}
                    >
                      <Text style={styles.avatarLetra}>
                        {estudiante.nombre_completo[0]?.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {/* DATOS */}
                  <View style={styles.estudianteDatos}>
                    <Text style={styles.estudianteNombre}>
                      {estudiante.nombre_completo}
                    </Text>
                    <Text style={styles.estudianteInfo}>
                      {estudiante.grado} · {estudiante.institucion}
                    </Text>
                    <Text style={styles.estudianteSemana}>
                      {estudiante.estadoSemana === "completada"
                        ? "Semana completada"
                        : estudiante.estadoSemana === "en_progreso"
                          ? "Actividad en progreso"
                          : "Sin completar esta semana"}
                    </Text>
                  </View>

                  {/* BADGES */}
                  <View style={styles.badgesContainer}>
                    {alertaConfig && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: alertaConfig.color + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeTexto,
                            { color: alertaConfig.color },
                          ]}
                        >
                          {alertaConfig.texto}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: estadoConfig.fondo },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeTexto,
                          { color: estadoConfig.color },
                        ]}
                      >
                        {estadoConfig.texto}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    paddingTop: 56,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  subtitulo: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  buscadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    gap: 8,
  },
  buscadorInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
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
  filtroTextoActivo: {
    color: Colors.blanco,
  },
  scrollView: { flex: 1 },
  listaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  listaLabel: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
    marginBottom: 4,
  },
  estudianteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.azulClaro,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  estudianteDatos: {
    flex: 1,
    gap: 2,
  },
  estudianteNombre: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  estudianteInfo: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  estudianteSemana: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  badgesContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTexto: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  sinResultadosContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  sinResultadosTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
