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
import {
  obtenerIndicadoresEstudiante,
  obtenerTendenciaEstudiante,
} from "../../../service/indicadores.service";
import { exportarReportePDF } from "../../../service/pdf.service";
import { useAuthStore } from "../../../store/authStore";

const NIVEL_ALERTA_CONFIG: Record<string, { color: string; fondo: string }> = {
  estable: { color: Colors.verdePrincipal, fondo: Colors.verdeClaro },
  observacion: { color: Colors.naranjaAlerta, fondo: "#FFF3E0" },
  seguimiento: { color: Colors.naranjaAlerta, fondo: "#FFF3E0" },
  prioritario: { color: Colors.rojoAlerta, fondo: "#FFEBEB" },
};

function obtenerColorNivel(nivel: string): string {
  const colores: Record<string, string> = {
    estable: Colors.verdePrincipal,
    observacion: Colors.naranjaAlerta,
    seguimiento: Colors.naranjaAlerta,
    prioritario: Colors.rojoAlerta,
  };
  return colores[nivel] || Colors.grisMedio;
}

function obtenerFondoNivel(nivel: string): string {
  const fondos: Record<string, string> = {
    estable: Colors.verdeClaro,
    observacion: "#FFF3E0",
    seguimiento: "#FFF3E0",
    prioritario: "#FFEBEB",
  };
  return fondos[nivel] || "#F0F0F0";
}

function capitalizarPrimera(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function calcularNivelGeneral(indicadores: { nivel: string }[]): string {
  if (indicadores.some((i) => i.nivel === "prioritario")) return "Prioritario";
  if (indicadores.some((i) => i.nivel === "seguimiento")) return "Seguimiento";
  if (indicadores.some((i) => i.nivel === "observacion")) return "Observación";
  return "Estable";
}

export default function ReporteIndividualScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { estudianteId } = useLocalSearchParams<{ estudianteId: string }>();

  const [perfil, setPerfil] = useState<any>(null);
  const [perfilDocente, setPerfilDocente] = useState<any>(null);
  const [actividadesCompletadas, setActividadesCompletadas] = useState(0);
  const [observacion, setObservacion] = useState<any>(null);
  const [textoObservacion, setTextoObservacion] = useState("");
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [resumenIA, setResumenIA] = useState<string>("");
  const [tieneIndicadores, setTieneIndicadores] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuardando, setIsGuardando] = useState(false);
  const [isExportando, setIsExportando] = useState(false);
  const [observacionEditada, setObservacionEditada] = useState(false);
  const [tendencia, setTendencia] = useState<any[]>([]);

  useEffect(() => {
    if (estudianteId && session?.user) cargarDatos();
  }, [estudianteId, session]);

  async function cargarDatos() {
    setIsLoading(true);
    try {
      const [
        perfilData,
        completadas,
        observacionData,
        perfilDocenteData,
        indicadoresData,
        tendenciaData,
      ] = await Promise.all([
        obtenerPerfilEstudiante(estudianteId),
        contarActividadesCompletadasEstudiante(estudianteId),
        obtenerObservacion(estudianteId, session!.user.id),
        obtenerPerfil(session!.user.id),
        obtenerIndicadoresEstudiante(estudianteId),
        obtenerTendenciaEstudiante(estudianteId),
      ]);

      setPerfil(perfilData);
      setActividadesCompletadas(completadas);
      setObservacion(observacionData);
      setTextoObservacion(observacionData?.texto || "");
      setPerfilDocente(perfilDocenteData);

      const indicadoresPorArea = indicadoresData
        .filter((i: any) => i.area !== null)
        .map((i: any) => ({
          area: capitalizarPrimera(i.area),
          nivel: capitalizarPrimera(i.nivel),
          puntuacion: Number(i.puntuacion),
          color: obtenerColorNivel(i.nivel),
          fondo: obtenerFondoNivel(i.nivel),
        }));

      const indicadorGeneral = indicadoresData.find(
        (i: any) => i.area === null,
      );

      setIndicadores(indicadoresPorArea);
      setTendencia(tendenciaData);
      setResumenIA(indicadorGeneral?.resumen_ia || "");
      setTieneIndicadores(indicadoresPorArea.length > 0);
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

  async function handleExportarPDF() {
    if (!perfil) return;

    setIsExportando(true);
    try {
      const nivelGeneral = tieneIndicadores
        ? calcularNivelGeneral(indicadores)
        : "Sin datos";

      await exportarReportePDF({
        nombreEstudiante: perfil.nombre_completo,
        grado: perfil.grado,
        institucion: perfil.institucion,
        actividadesCompletadas,
        nivelGeneral,
        indicadores: tieneIndicadores
          ? indicadores.map((ind) => ({
              area: ind.area,
              nivel: ind.nivel,
              puntuacion: ind.puntuacion,
              color: ind.color,
            }))
          : [],
        tendencia: tendencia.map((t) => ({
          semana: t.semana,
          valor: t.valor,
        })),
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

  if (isLoading) return <LoadingScreen mensaje="Cargando reporte..." />;

  if (!session?.user || !perfil) return null;

  const nivelGeneral = tieneIndicadores
    ? calcularNivelGeneral(indicadores)
    : "Sin datos";

  const nivelConfig =
    NIVEL_ALERTA_CONFIG[nivelGeneral.toLowerCase()] ||
    NIVEL_ALERTA_CONFIG["observacion"];

  const inicialNombre = perfil.nombre_completo?.[0]?.toUpperCase() || "E";
  const alturaMaxBarra = 80;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
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
        {!tieneIndicadores ? (
          <View style={styles.sinDatosCard}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={32}
              color={Colors.grisMedio}
            />
            <Text style={styles.sinDatosTexto}>
              Los indicadores aparecerán cuando el estudiante complete su
              primera actividad.
            </Text>
          </View>
        ) : (
          <View style={styles.indicadoresCard}>
            {indicadores.map((indicador, index) => (
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
                {index < indicadores.length - 1 && (
                  <View style={styles.separador} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* RESUMEN DE IA */}
      {resumenIA ? (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>ANÁLISIS DE IA</Text>
          <View style={styles.resumenIACard}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color={Colors.lilaAcento}
            />
            <Text style={styles.resumenIATexto}>{resumenIA}</Text>
          </View>
        </View>
      ) : null}

      {/* TENDENCIA */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          TENDENCIA ÚLTIMAS {tendencia.length} SEMANAS
        </Text>
        {tendencia.length === 0 ? (
          <View style={styles.sinDatosCard}>
            <MaterialCommunityIcons
              name="chart-line"
              size={32}
              color={Colors.grisMedio}
            />
            <Text style={styles.sinDatosTexto}>
              La tendencia aparecerá cuando el estudiante complete actividades.
            </Text>
          </View>
        ) : (
          <View style={styles.tendenciaCard}>
            <View style={styles.tendenciaBarras}>
              {tendencia.map((item) => (
                <View key={item.fecha} style={styles.tendenciaItem}>
                  <View style={styles.tendenciaBarraContainer}>
                    <View
                      style={[
                        styles.tendenciaBarra,
                        {
                          height: alturaMaxBarra * item.valor,
                          backgroundColor:
                            item.valor >= 0.75
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
        )}
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
  sinDatosCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  sinDatosTexto: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 20,
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
  resumenIACard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    borderLeftWidth: 4,
    borderLeftColor: Colors.lilaAcento,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  resumenIATexto: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    lineHeight: 20,
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
