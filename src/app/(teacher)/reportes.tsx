import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { buscarEstudiantes } from "../../service/docente.service";

export default function ReportesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  async function handleBuscar() {
    if (!query.trim()) return;
    setIsLoading(true);
    setBuscado(true);
    try {
      const data = await buscarEstudiantes(query.trim());
      setResultados(data);
    } catch (error) {
      console.log("Error buscando estudiantes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLimpiar() {
    setQuery("");
    setResultados([]);
    setBuscado(false);
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Reportes</Text>
        <Text style={styles.subtitulo}>
          Busca un estudiante para ver su reporte individual
        </Text>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.grisMedio}
          />
          <TextInput
            style={styles.buscadorInput}
            placeholder="Nombre del estudiante..."
            placeholderTextColor={Colors.grisMedio}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleLimpiar}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={Colors.grisMedio}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.buscarButton}
          onPress={handleBuscar}
          activeOpacity={0.8}
        >
          <Text style={styles.buscarButtonTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* RESULTADOS */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.resultadosContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.azulPrincipal}
            style={{ marginTop: 40 }}
          />
        ) : !buscado ? (
          <View style={styles.estadoInicial}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={64}
              color={Colors.azulClaro}
            />
            <Text style={styles.estadoInicialTexto}>
              Ingresa el nombre de un estudiante para ver su reporte
            </Text>
          </View>
        ) : resultados.length === 0 ? (
          <View style={styles.estadoInicial}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={64}
              color={Colors.azulClaro}
            />
            <Text style={styles.estadoInicialTexto}>
              No se encontraron estudiantes con "{query}"
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultadosLabel}>
              {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
            </Text>
            {resultados.map((estudiante) => (
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
  buscadorRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  buscadorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    paddingHorizontal: 14,
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
  buscarButton: {
    backgroundColor: Colors.azulPrincipal,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    elevation: 2,
  },
  buscarButtonTexto: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.blanco,
  },
  scrollView: { flex: 1 },
  resultadosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  estadoInicial: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
    paddingHorizontal: 32,
  },
  estadoInicialTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 22,
  },
  resultadosLabel: {
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
