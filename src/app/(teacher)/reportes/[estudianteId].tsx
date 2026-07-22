import LoadingScreen from "@/src/components/ui/LoadingScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { obtenerPerfil } from "../../../service/auth.service";
import {
  contarActividadesCompletadasEstudiante,
  guardarObservacion,
  obtenerObservacion,
  obtenerPerfilEstudiante,
} from "../../../service/docente.service";
import { exportarReportePDF } from "../../../service/pdf.service";
import { useAuthStore } from "../../../store/authStore";
// Datos de prueba hardcodeados hasta que el módulo de IA esté listo
const INDICADORES_PRUEBA = [
  {
    area: "Escolar",
    nivel: "Estable",
    puntuacion: 85,
    color: Colors.verdePrincipal,
    fondo: Colors.verdeClaro,
  },
  {
    area: "Familiar",
    nivel: "Prioritario",
    puntuacion: 25,
    color: Colors.rojoAlerta,
    fondo: "#FFEBEB",
  },
  {
    area: "Personal",
    nivel: "Seguimiento",
    puntuacion: 45,
    color: Colors.naranjaAlerta,
    fondo: "#FFF3E0",
  },
  {
    area: "Social",
    nivel: "Estable",
    puntuacion: 78,
    color: Colors.verdePrincipal,
    fondo: Colors.verdeClaro,
  },
  {
    area: "Afectiva",
    nivel: "Prioritario",
    puntuacion: 20,
    color: Colors.rojoAlerta,
    fondo: "#FFEBEB",
  },
];

const TENDENCIA_PRUEBA = [
  { semana: "Sem 5", valor: 0.7 },
  { semana: "Sem 6", valor: 0.55 },
  { semana: "Sem 7", valor: 0.4 },
  { semana: "Sem 8", valor: 0.3 },
];

const NIVEL_ALERTA_CONFIG: Record<string, { color: string; fondo: string }> = {
  Estable: { color: Colors.verdePrincipal, fondo: Colors.verdeClaro },
  Observación: { color: Colors.naranjaAlerta, fondo: "#FFF3E0" },
  Seguimiento: { color: Colors.naranjaAlerta, fondo: "#FFF3E0" },
  Prioritario: { color: Colors.rojoAlerta, fondo: "#FFEBEB" },
};

// Calcula el nivel general basado en los indicadores
function calcularNivelGeneral(indicadores: typeof INDICADORES_PRUEBA): string {
  if (indicadores.some((i) => i.nivel === "Prioritario")) return "Prioritario";
  if (indicadores.some((i) => i.nivel === "Seguimiento")) return "Seguimiento";
  if (indicadores.some((i) => i.nivel === "Observación")) return "Observación";
  return "Estable";
}

export default function ReporteIndividualScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { estudianteId } = useLocalSearchParams<{ estudianteId: string }>();

  const [perfil, setPerfil] = useState<any>(null);
  const [actividadesCompletadas, setActividadesCompletadas] = useState(0);
  const [observacion, setObservacion] = useState<any>(null);
  const [textoObservacion, setTextoObservacion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGuardando, setIsGuardando] = useState(false);
  const [observacionEditada, setObservacionEditada] = useState(false);
  const [isExportando, setIsExportando] = useState(false);
  const [perfilDocente, setPerfilDocente] = useState<any>(null);

  useEffect(() => {
    if (estudianteId && session?.user) cargarDatos();
  }, [estudianteId, session]);

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const [perfilData, completadas, observacionData, perfilDocenteData] =
        await Promise.all([
          obtenerPerfilEstudiante(estudianteId),
          contarActividadesCompletadasEstudiante(estudianteId),
          obtenerObservacion(estudianteId, session!.user.id),
          obtenerPerfil(session!.user.id),
        ]);

      setPerfil(perfilData);
      setActividadesCompletadas(completadas);
      setObservacion(observacionData);
      setTextoObservacion(observacionData?.texto || "");
      setPerfilDocente(perfilDocenteData);
    } catch (error) {
      console.log("Error cargando reporte:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuardarObservacion() {
    if (!textoObservacion.trim()) {
      Alert.alert("Campo vacío", "Escribe una observación antes de guardar.");
      return;
    }

    setIsGuardando(true);
    try {
      await guardarObservacion(
        estudianteId,
        session!.user.id,
        textoObservacion.trim(),
        observacion?.id,
      );
      setObservacionEditada(false);
      Alert.alert("✓ Guardado", "La observación fue guardada correctamente.");
      // Recargamos para obtener el id si era nueva
      const nueva = await obtenerObservacion(estudianteId, session!.user.id);
      setObservacion(nueva);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo guardar la observación.",
      );
    } finally {
      setIsGuardando(false);
    }
  }

  if (isLoading) return <LoadingScreen mensaje="Cargando reporte..." />;

  if (!session?.user || !perfil) return null;

  const nivelGeneral = calcularNivelGeneral(INDICADORES_PRUEBA);
  const nivelConfig = NIVEL_ALERTA_CONFIG[nivelGeneral];
  const inicialNombre = perfil.nombre_completo?.[0]?.toUpperCase() || "E";
  const alturaMaxBarra = 80;

  async function handleExportarPDF() {
    if (!perfil) return;

    setIsExportando(true);
    try {
      await exportarReportePDF({
        nombreEstudiante: perfil.nombre_completo,
        grado: perfil.grado,
        institucion: perfil.institucion,
        actividadesCompletadas,
        nivelGeneral: calcularNivelGeneral(INDICADORES_PRUEBA),
        indicadores: INDICADORES_PRUEBA.map((ind) => ({
          area: ind.area,
          nivel: ind.nivel,
          puntuacion: ind.puntuacion,
          color: ind.color,
        })),
        tendencia: TENDENCIA_PRUEBA,
        observacion: textoObservacion,
        nombreDocente: perfilDocente?.nombre_completo || "Docente",
        fechaReporte: new Date().toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo generar el PDF.");
    } finally {
      setIsExportando(false);
    }
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER CON BOTÓN ATRÁS */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={Colors.grisOscuro}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Reporte individual</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ENCABEZADO DEL ESTUDIANTE */}
      <View style={styles.estudianteHeader}>
        {perfil.foto_url ? (
          <Image source={{ uri: perfil.foto_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetra}>{inicialNombre}</Text>
          </View>
        )}
        <View style={styles.estudianteDatos}>
          <Text style={styles.estudianteNombre}>{perfil.nombre_completo}</Text>
          <Text style={styles.estudianteInfo}>
            {perfil.grado} · {actividadesCompletadas} actividades
          </Text>
          <View
            style={[styles.nivelBadge, { backgroundColor: nivelConfig.fondo }]}
          >
            <Text
              style={[styles.nivelBadgeTexto, { color: nivelConfig.color }]}
            >
              {nivelGeneral}
            </Text>
          </View>
        </View>
      </View>

      {/* INDICADORES POR ÁREA */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>INDICADORES POR ÁREA</Text>
        <View style={styles.indicadoresCard}>
          {INDICADORES_PRUEBA.map((indicador, index) => (
            <View key={indicador.area}>
              <View style={styles.indicadorItem}>
                <Text style={styles.indicadorArea}>{indicador.area}</Text>
                <View style={styles.indicadorBarraRow}>
                  <View style={styles.indicadorBarra}>
                    <View
                      style={[
                        styles.indicadorBarraFill,
                        {
                          width: `${indicador.puntuacion}%`,
                          backgroundColor: indicador.color,
                        },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.nivelBadgeSmall,
                      { backgroundColor: indicador.fondo },
                    ]}
                  >
                    <Text
                      style={[
                        styles.nivelBadgeSmallTexto,
                        { color: indicador.color },
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

      {/* TENDENCIA ÚLTIMAS 4 SEMANAS */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>TENDENCIA ÚLTIMAS 4 SEMANAS</Text>
        <View style={styles.tendenciaCard}>
          <View style={styles.tendenciaBarras}>
            {TENDENCIA_PRUEBA.map((item) => (
              <View key={item.semana} style={styles.tendenciaItem}>
                <View style={styles.tendenciaBarraContainer}>
                  <View
                    style={[
                      styles.tendenciaBarra,
                      {
                        height: alturaMaxBarra * item.valor,
                        backgroundColor:
                          item.valor >= 0.7
                            ? Colors.verdePrincipal
                            : item.valor >= 0.5
                              ? Colors.naranjaAlerta
                              : Colors.rojoAlerta,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.tendenciaSemana}>{item.semana}</Text>
              </View>
            ))}
          </View>
          <View style={styles.tendenciaLeyenda}>
            <View style={styles.leyendaItem}>
              <View
                style={[
                  styles.leyendaCircle,
                  { backgroundColor: Colors.verdePrincipal },
                ]}
              />
              <Text style={styles.leyendaTexto}>Estable</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View
                style={[
                  styles.leyendaCircle,
                  { backgroundColor: Colors.naranjaAlerta },
                ]}
              />
              <Text style={styles.leyendaTexto}>Seguimiento</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View
                style={[
                  styles.leyendaCircle,
                  { backgroundColor: Colors.rojoAlerta },
                ]}
              />
              <Text style={styles.leyendaTexto}>Prioritario</Text>
            </View>
          </View>
        </View>
      </View>

      {/* OBSERVACIÓN DEL DOCENTE */}
      <View style={styles.seccion}>
        <View style={styles.observacionHeader}>
          <Text style={styles.seccionTitulo}>OBSERVACIÓN DEL DOCENTE</Text>
          <Text style={styles.observacionConfidencial}>Confidencial</Text>
        </View>
        <View style={styles.observacionCard}>
          <TextInput
            style={styles.observacionInput}
            placeholder="Escribe tus observaciones sobre este estudiante..."
            placeholderTextColor={Colors.grisMedio}
            multiline
            numberOfLines={4}
            value={textoObservacion}
            onChangeText={(t) => {
              setTextoObservacion(t);
              setObservacionEditada(true);
            }}
            textAlignVertical="top"
          />
          {observacion?.updated_at && !observacionEditada && (
            <Text style={styles.observacionFecha}>
              Última actualización:{" "}
              {new Date(observacion.updated_at).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.guardarButton,
              (!observacionEditada || isGuardando) &&
                styles.guardarButtonDisabled,
            ]}
            onPress={handleGuardarObservacion}
            disabled={!observacionEditada || isGuardando}
            activeOpacity={0.8}
          >
            {isGuardando ? (
              <ActivityIndicator color={Colors.blanco} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color={Colors.blanco}
                />
                <Text style={styles.guardarButtonTexto}>
                  Guardar observación
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTÓN EXPORTAR PDF */}
      <TouchableOpacity
        style={[
          styles.exportarButton,
          isExportando && styles.exportarButtonDisabled,
        ]}
        onPress={handleExportarPDF}
        disabled={isExportando}
        activeOpacity={0.8}
      >
        {isExportando ? (
          <ActivityIndicator color={Colors.blanco} size="small" />
        ) : (
          <>
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={20}
              color={Colors.blanco}
            />
            <Text style={styles.exportarButtonTexto}>Exportar reporte PDF</Text>
          </>
        )}
      </TouchableOpacity>
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
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blanco,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  headerTitulo: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  estudianteHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  estudianteDatos: {
    flex: 1,
    gap: 4,
  },
  estudianteNombre: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  estudianteInfo: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  nivelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  nivelBadgeTexto: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
  seccion: { gap: 10 },
  seccionTitulo: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
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
  indicadorBarraRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  indicadorBarra: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.azulClaro,
    borderRadius: 4,
  },
  indicadorBarraFill: {
    height: 8,
    borderRadius: 4,
  },
  nivelBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  nivelBadgeSmallTexto: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  separador: {
    height: 1,
    backgroundColor: Colors.azulClaro,
  },
  tendenciaCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    gap: 16,
  },
  tendenciaBarras: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 100,
  },
  tendenciaItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  tendenciaBarraContainer: {
    height: 80,
    justifyContent: "flex-end",
    width: 40,
  },
  tendenciaBarra: {
    width: 40,
    borderRadius: 6,
    minHeight: 8,
  },
  tendenciaSemana: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  tendenciaLeyenda: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leyendaCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leyendaTexto: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  observacionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  observacionConfidencial: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.lilaAcento,
  },
  observacionCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    gap: 12,
  },
  observacionInput: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    minHeight: 100,
    lineHeight: 22,
  },
  observacionFecha: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  guardarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
  },
  guardarButtonDisabled: {
    backgroundColor: Colors.azulClaro,
    elevation: 0,
  },
  guardarButtonTexto: {
    color: Colors.blanco,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  exportarButtonDisabled: {
    opacity: 0.7,
    elevation: 0,
  },
  exportarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 4,
    marginTop: 8,
  },
  exportarButtonTexto: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
