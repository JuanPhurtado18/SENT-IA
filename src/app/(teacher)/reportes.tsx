import LoadingScreen from "@/src/components/ui/LoadingScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
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

export default function ReportesScreen() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarEstudiantes();
    }, []),
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

  // Filtra en tiempo real ignorando mayúsculas, minúsculas y acentos
  const estudiantesFiltrados = estudiantes.filter((e) => {
    if (!query.trim()) return true;
    const normalizar = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    return (
      normalizar(e.nombre_completo).includes(normalizar(query)) ||
      normalizar(e.institucion || "").includes(normalizar(query)) ||
      normalizar(e.grado || "").includes(normalizar(query))
    );
  });

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Reportes</Text>
        <Text style={styles.subtitulo}>
          {estudiantes.length} estudiante{estudiantes.length !== 1 ? "s" : ""}{" "}
          registrados
        </Text>
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
          placeholder="Buscar por nombre, grado o institución..."
          placeholderTextColor={Colors.grisMedio}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={Colors.grisMedio}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* LISTA */}
      {isLoading ? (
        <LoadingScreen mensaje="Cargando reportes..." />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultadosContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {estudiantesFiltrados.length === 0 ? (
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={56}
                color={Colors.azulClaro}
              />
              <Text style={styles.sinResultadosTexto}>
                {query.length > 0
                  ? `No se encontraron resultados para "${query}"`
                  : "No hay estudiantes registrados"}
              </Text>
            </View>
          ) : (
            <>
              {query.length > 0 && (
                <Text style={styles.resultadosLabel}>
                  {estudiantesFiltrados.length} resultado
                  {estudiantesFiltrados.length !== 1 ? "s" : ""}
                </Text>
              )}
              {estudiantesFiltrados.map((estudiante) => (
                <TouchableOpacity
                  key={estudiante.id}
                  style={styles.estudianteCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(teacher)/reportes/[estudianteId]",
                      params: { estudianteId: estudiante.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  {estudiante.foto_url ? (
                    <Image
                      source={{ uri: estudiante.foto_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarLetra}>
                        {estudiante.nombre_completo[0]?.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.estudianteDatos}>
                    <Text style={styles.estudianteNombre}>
                      {estudiante.nombre_completo}
                    </Text>
                    <Text style={styles.estudianteInfo}>
                      {estudiante.grado} · {estudiante.institucion}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={Colors.grisMedio}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    paddingTop: 56,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 4,
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
    marginBottom: 16,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: { flex: 1 },
  resultadosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  resultadosLabel: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisMedio,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sinResultados: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
    paddingHorizontal: 32,
  },
  sinResultadosTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  estudianteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    elevation: 1,
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
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  estudianteInfo: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
});
