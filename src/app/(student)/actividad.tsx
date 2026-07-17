import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  guardarRespuesta,
  obtenerActividadActiva,
  obtenerRespuestasExistentes,
  obtenerSituacionesDeActividad,
} from "../../service/actividades.service";
import { procesarActividad } from "../../service/indicadores.service";
import { useAuthStore } from "../../store/authStore";

const OPCIONES = ["A", "B", "C", "D"] as const;
const AREA_LABELS: Record<string, string> = {
  escolar: "Área escolar",
  familiar: "Área familiar",
  personal: "Área personal",
  social: "Área social",
  afectiva: "Área afectiva",
};
const AREA_COLORS: Record<string, string> = {
  escolar: Colors.azulPrincipal,
  familiar: Colors.verdePrincipal,
  personal: Colors.lilaAcento,
  social: Colors.naranjaAlerta,
  afectiva: "#E07FBF",
};

export default function ActividadScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [actividad, setActividad] = useState<any>(null);
  const [situaciones, setSituaciones] = useState<any[]>([]);
  const [indexActual, setIndexActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGuardando, setIsGuardando] = useState(false);
  const [isProcesando, setIsProcesando] = useState(false);
  const tiempoInicioRef = useRef<number>(Date.now());
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (session?.user) cargarActividad();
  }, [session]);

  // Bloquea el botón de atrás de Android durante la actividad
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert(
          "Salir de la actividad",
          "Tus respuestas hasta ahora quedan guardadas. Puedes continuar después.",
          [
            { text: "Quedarse", style: "cancel" },
            { text: "Salir", onPress: () => router.back() },
          ],
        );
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  async function cargarActividad() {
    setIsLoading(true);
    try {
      const actividadData = await obtenerActividadActiva();
      if (!actividadData) {
        Alert.alert(
          "Sin actividad",
          "No hay ninguna actividad disponible en este momento.",
        );
        router.back();
        return;
      }

      const [situacionesData, respuestasExistentes] = await Promise.all([
        obtenerSituacionesDeActividad(actividadData.id),
        obtenerRespuestasExistentes(session!.user.id, actividadData.id),
      ]);

      console.log(
        "Respuestas existentes cargadas:",
        JSON.stringify(respuestasExistentes),
      );
      console.log(
        "Total respuestas:",
        Object.keys(respuestasExistentes).length,
      );

      setActividad(actividadData);
      setSituaciones(situacionesData);
      setRespuestas(respuestasExistentes);

      const ultimaRespondida = situacionesData.findIndex(
        (s) => !respuestasExistentes[s.id],
      );
      console.log("Retomando desde índice:", ultimaRespondida);
      setIndexActual(ultimaRespondida === -1 ? 0 : ultimaRespondida);
    } catch (error) {
      console.log("Error cargando actividad:", error);
      Alert.alert("Error", "No se pudo cargar la actividad. Intenta de nuevo.");
      router.back();
    } finally {
      setIsLoading(false);
      tiempoInicioRef.current = Date.now();
    }
  }

  async function handleSeleccionarOpcion(opcion: string) {
    const situacionActual = situaciones[indexActual];

    if (!situacionActual) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.azulPrincipal} />
          <Text style={styles.loadingText}>Cargando situación...</Text>
        </View>
      );
    }
    const tiempoSegundos = Math.floor(
      (Date.now() - tiempoInicioRef.current) / 1000,
    );

    const nuevasRespuestas = { ...respuestas, [situacionActual.id]: opcion };
    setRespuestas(nuevasRespuestas);

    try {
      await guardarRespuesta(
        session!.user.id,
        situacionActual.id,
        opcion,
        tiempoSegundos,
      );
      console.log("Respuesta guardada:", situacionActual.orden, opcion);
    } catch (error) {
      console.log("Error guardando respuesta:", error);
    }
  }

  async function handleSiguiente() {
    const situacionActual = situaciones[indexActual];
    if (!respuestas[situacionActual.id]) return;

    const esUltima = indexActual === situaciones.length - 1;

    if (esUltima) {
      await handleFinalizar();
    } else {
      setIndexActual(indexActual + 1);
      tiempoInicioRef.current = Date.now();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }

  async function handleFinalizar() {
    setIsProcesando(true);
    try {
      await procesarActividad(session!.user.id, actividad.id);
    } catch (error) {
      // Si la Edge Function falla, igual pasamos a la pantalla de finalización
      // Las respuestas ya están guardadas, el procesamiento se puede reintentar
      console.log("Error procesando actividad:", error);
    } finally {
      setIsProcesando(false);
      router.replace("/(student)/finalizacion");
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
        <Text style={styles.loadingText}>Cargando actividad...</Text>
      </View>
    );
  }

  if (isProcesando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
        <Text style={styles.loadingText}>Guardando tus respuestas...</Text>
        <Text style={styles.loadingSubtext}>Esto tomará un momento</Text>
      </View>
    );
  }

  const situacionActual = situaciones[indexActual];
  const opcionSeleccionada = respuestas[situacionActual?.id];
  const esUltima = indexActual === situaciones.length - 1;
  const progreso = (indexActual + 1) / situaciones.length;

  const opcionesTexto = [
    situacionActual?.opcion_a,
    situacionActual?.opcion_b,
    situacionActual?.opcion_c,
    situacionActual?.opcion_d,
  ];

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Salir de la actividad",
              "Tus respuestas hasta ahora quedan guardadas. Puedes continuar después.",
              [
                { text: "Quedarse", style: "cancel" },
                { text: "Salir", onPress: () => router.back() },
              ],
            );
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.grisOscuro}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitulo}>
            Actividad Semana {actividad?.numero_semana}
          </Text>
          <Text style={styles.headerSubtitulo}>
            Situación {indexActual + 1} de {situaciones.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={Colors.grisMedio}
          />
          <TimerDisplay tiempoInicioRef={tiempoInicioRef} />
        </View>
      </View>

      {/* BARRA DE PROGRESO */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBarFill, { width: `${progreso * 100}%` }]}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CHIP DE ÁREA */}
        <View
          style={[
            styles.areaChip,
            { backgroundColor: AREA_COLORS[situacionActual?.area] + "20" },
          ]}
        >
          <Text
            style={[
              styles.areaChipText,
              { color: AREA_COLORS[situacionActual?.area] },
            ]}
          >
            {AREA_LABELS[situacionActual?.area]}
          </Text>
        </View>

        {/* SITUACIÓN */}
        <View style={styles.situacionCard}>
          <Text style={styles.situacionLabel}>SITUACIÓN</Text>
          <Text style={styles.situacionTexto}>{situacionActual?.contexto}</Text>
        </View>

        {/* PREGUNTA */}
        <Text style={styles.pregunta}>{situacionActual?.pregunta}</Text>

        {/* OPCIONES */}
        <View style={styles.opcionesContainer}>
          {OPCIONES.map((letra, index) => {
            const seleccionada = opcionSeleccionada === letra;
            return (
              <TouchableOpacity
                key={letra}
                style={[
                  styles.opcionButton,
                  seleccionada && styles.opcionButtonSelected,
                ]}
                onPress={() => handleSeleccionarOpcion(letra)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.opcionLetraCircle,
                    seleccionada && styles.opcionLetraCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.opcionLetra,
                      seleccionada && styles.opcionLetraSelected,
                    ]}
                  >
                    {letra}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.opcionTexto,
                    seleccionada && styles.opcionTextoSelected,
                  ]}
                >
                  {opcionesTexto[index]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTÓN SIGUIENTE / FINALIZAR */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.siguienteButton,
            !opcionSeleccionada && styles.siguienteButtonDisabled,
          ]}
          onPress={handleSiguiente}
          disabled={!opcionSeleccionada || isGuardando}
          activeOpacity={0.8}
        >
          <Text style={styles.siguienteButtonText}>
            {esUltima ? "Finalizar" : "Siguiente →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Componente separado para el timer para evitar re-renders del componente padre
function TimerDisplay({
  tiempoInicioRef,
}: {
  tiempoInicioRef: React.RefObject<number>;
}) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tiempoInicioRef.current) / 1000);
      setSegundos(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return (
    <Text style={styles.timerText}>
      {minutos}:{segs.toString().padStart(2, "0")}
    </Text>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  loadingSubtext: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: Colors.blanco,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitulo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  headerSubtitulo: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisMedio,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.azulClaro,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.azulPrincipal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  areaChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  areaChipText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  situacionCard: {
    backgroundColor: Colors.azulClaro,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  situacionLabel: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
    letterSpacing: 1,
  },
  situacionTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    lineHeight: 22,
  },
  pregunta: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    lineHeight: 24,
  },
  opcionesContainer: {
    gap: 10,
  },
  opcionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.azulClaro,
    elevation: 1,
  },
  opcionButtonSelected: {
    borderColor: Colors.azulPrincipal,
    backgroundColor: "#EBF4FF",
  },
  opcionLetraCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.azulClaro,
  },
  opcionLetraCircleSelected: {
    backgroundColor: Colors.azulPrincipal,
    borderColor: Colors.azulPrincipal,
  },
  opcionLetra: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
  },
  opcionLetraSelected: {
    color: Colors.blanco,
  },
  opcionTexto: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    lineHeight: 20,
  },
  opcionTextoSelected: {
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.blanco,
    borderTopWidth: 1,
    borderTopColor: Colors.azulClaro,
  },
  siguienteButton: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
  },
  siguienteButtonDisabled: {
    backgroundColor: Colors.azulClaro,
    elevation: 0,
  },
  siguienteButtonText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
