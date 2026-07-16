import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  obtenerActividadActiva,
  obtenerResumenActividad,
} from "../../service/actividades.service";
import { useAuthStore } from "../../store/authStore";

const MENSAJES_MOTIVACIONALES = [
  "Cada semana que participas contribuye a tu bienestar emocional. ¡Sigue así!",
  "Tu constancia hace la diferencia. ¡Nos vemos la próxima semana!",
  "Gracias por tomarte el tiempo de reflexionar sobre cómo te sientes.",
  "Completar esta actividad es un paso importante para tu bienestar. ¡Bien hecho!",
  "Tu participación ayuda a construir un ambiente escolar más saludable.",
];

function formatearTiempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  if (minutos === 0) return `${segs} seg`;
  if (segs === 0) return `${minutos} min`;
  return `${minutos} min ${segs} seg`;
}

function obtenerProximaActividad(): string {
  const proxima = new Date();
  proxima.setDate(proxima.getDate() + 7);
  return proxima.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
}

export default function FinalizacionScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [resumen, setResumen] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mensajeMotivacional =
    MENSAJES_MOTIVACIONALES[
      Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length)
    ];

  // Bloquea el botón de atrás — no tiene sentido volver a la actividad completada
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (session?.user) cargarResumen();
  }, [session]);

  async function cargarResumen() {
    setIsLoading(true);
    try {
      const actividad = await obtenerActividadActiva();
      if (!actividad) return;

      const data = await obtenerResumenActividad(
        session!.user.id,
        actividad.id,
      );
      setResumen(data);
    } catch (error) {
      console.log("Error cargando resumen:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.azulPrincipal} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ÍCONO DE COMPLETADO */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="check-bold"
            size={56}
            color={Colors.blanco}
          />
        </View>
      </View>

      {/* TÍTULO Y SUBTÍTULO */}
      <Text style={styles.titulo}>¡Actividad completada!</Text>
      <Text style={styles.subtitulo}>
        Gracias por completar la actividad de esta semana. Tus respuestas han
        sido registradas de forma confidencial.
      </Text>

      {/* RESUMEN */}
      <View style={styles.resumenCard}>
        <Text style={styles.resumenTitulo}>RESUMEN</Text>

        <View style={styles.resumenItem}>
          <View style={styles.resumenItemLeft}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color={Colors.verdePrincipal}
            />
            <Text style={styles.resumenLabel}>Situaciones respondidas</Text>
          </View>
          <Text style={styles.resumenValor}>
            {resumen?.situacionesRespondidas ?? 0} /{" "}
            {resumen?.totalSituaciones ?? 10}
          </Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.resumenItem}>
          <View style={styles.resumenItemLeft}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={Colors.azulPrincipal}
            />
            <Text style={styles.resumenLabel}>Tiempo total</Text>
          </View>
          <Text style={styles.resumenValor}>
            {formatearTiempo(resumen?.tiempoTotalSegundos ?? 0)}
          </Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.resumenItem}>
          <View style={styles.resumenItemLeft}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={18}
              color={Colors.lilaAcento}
            />
            <Text style={styles.resumenLabel}>Próxima actividad</Text>
          </View>
          <Text style={styles.resumenValorDestacado}>
            {obtenerProximaActividad()}
          </Text>
        </View>
      </View>

      {/* MENSAJE MOTIVACIONAL */}
      <View style={styles.motivacionalCard}>
        <MaterialCommunityIcons
          name="heart-outline"
          size={20}
          color={Colors.verdePrincipal}
        />
        <Text style={styles.motivacionalTexto}>{mensajeMotivacional}</Text>
      </View>

      {/* BOTONES */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.replace("/(student)")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>Volver al inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.replace("/(student)/actividades")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Ver mi historial</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: "center",
    gap: 20,
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.verdePrincipal,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.verdePrincipal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  titulo: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  resumenCard: {
    width: "100%",
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  resumenTitulo: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
    marginBottom: 4,
  },
  resumenItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumenItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resumenLabel: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
  },
  resumenValor: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
  },
  resumenValorDestacado: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
  },
  separador: {
    height: 1,
    backgroundColor: Colors.azulClaro,
  },
  motivacionalCard: {
    width: "100%",
    backgroundColor: Colors.verdeClaro,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  motivacionalTexto: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.verdePrincipal,
    lineHeight: 20,
  },
  botonesContainer: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
  },
  buttonPrimaryText: {
    color: Colors.blanco,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.azulPrincipal,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: Colors.azulPrincipal,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
