import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdministrarPerfilModal from "../../components/admin/AdministrarPerfilModal";
import AgregarDocenteModal from "../../components/admin/AgregarDocenteModal";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { Colors } from "../../constants/Colors";
import { obtenerTodosLosUsuarios } from "../../service/admin.service";
import { cerrarSesion } from "../../service/auth.service";

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [showAdministrar, setShowAdministrar] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, []),
  );

  async function cargarUsuarios() {
    setIsLoading(true);
    try {
      const data = await obtenerTodosLosUsuarios();
      setUsuarios(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Confirmas que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: cerrarSesion },
    ]);
  }

  const docentes = usuarios.filter((u) => u.role === "docente");
  const estudiantes = usuarios.filter((u) => u.role === "estudiante");

  function renderUsuario({ item }: { item: any }) {
    const esDocente = item.role === "docente";
    return (
      <View
        style={[
          styles.usuarioCard,
          item.bloqueado && styles.usuarioCardBloqueado,
        ]}
      >
        <View style={styles.usuarioAvatarContainer}>
          <View
            style={[
              styles.usuarioAvatar,
              {
                backgroundColor: esDocente
                  ? Colors.lilaAcento
                  : Colors.azulPrincipal,
              },
            ]}
          >
            <Text style={styles.usuarioAvatarLetra}>
              {String(item.nombre_completo?.[0]?.toUpperCase() ?? "?")}
            </Text>
          </View>
          {item.bloqueado && (
            <View style={styles.bloqueadoIcon}>
              <MaterialCommunityIcons
                name="lock"
                size={10}
                color={Colors.blanco}
              />
            </View>
          )}
        </View>

        <View style={styles.usuarioDatos}>
          <Text style={styles.usuarioNombre} numberOfLines={1}>
            {item.nombre_completo}
          </Text>
          <View style={styles.usuarioMetaRow}>
            <View
              style={[
                styles.rolChip,
                { backgroundColor: esDocente ? "#EEF4FF" : Colors.verdeClaro },
              ]}
            >
              <Text
                style={[
                  styles.rolChipTexto,
                  {
                    color: esDocente
                      ? Colors.azulPrincipal
                      : Colors.verdePrincipal,
                  },
                ]}
              >
                {esDocente ? "Docente" : "Estudiante"}
              </Text>
            </View>
            {item.bloqueado && (
              <View style={styles.bloqueadoChip}>
                <Text style={styles.bloqueadoChipTexto}>Bloqueado</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.administrarButton}
          onPress={() => {
            setUsuarioSeleccionado(item);
            setShowAdministrar(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.administrarButtonTexto}>Administrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) return <LoadingScreen mensaje="Cargando usuarios..." />;

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Panel de administración</Text>
          <Text style={styles.headerTitulo}>Gestión de usuarios</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons
            name="logout"
            size={22}
            color={Colors.rojoAlerta}
          />
        </TouchableOpacity>
      </View>
      {/* MÉTRICAS */}
      <View style={styles.metricasRow}>
        <View style={styles.metricaCard}>
          <Text style={styles.metricaNumero}>{docentes.length}</Text>
          <Text style={styles.metricaLabel}>Docentes</Text>
        </View>
        <View style={styles.metricaCard}>
          <Text
            style={[styles.metricaNumero, { color: Colors.verdePrincipal }]}
          >
            {estudiantes.length}
          </Text>
          <Text style={styles.metricaLabel}>Estudiantes</Text>
        </View>
        <View style={styles.metricaCard}>
          <Text style={[styles.metricaNumero, { color: Colors.rojoAlerta }]}>
            {usuarios.filter((u) => u.bloqueado).length}
          </Text>
          <Text style={styles.metricaLabel}>Bloqueados</Text>
        </View>
      </View>
      {/* LISTA */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={renderUsuario}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.sinUsuarios}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={48}
              color={Colors.azulClaro}
            />
            <Text style={styles.sinUsuariosTexto}>
              No hay usuarios registrados
            </Text>
          </View>
        }
      />
      {/* BOTÓN AGREGAR DOCENTE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.agregarButton}
          onPress={() => setShowAgregar(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={20}
            color={Colors.blanco}
          />
          <Text style={styles.agregarButtonTexto}>Agregar docente</Text>
        </TouchableOpacity>
      </View>
      {/* MODALES */}
      <AdministrarPerfilModal
        visible={showAdministrar}
        onClose={() => {
          setShowAdministrar(false);
          setUsuarioSeleccionado(null);
        }}
        onActualizado={cargarUsuarios}
        usuario={usuarioSeleccionado}
      />
      <AgregarDocenteModal
        visible={showAgregar}
        onClose={() => setShowAgregar(false)}
        onCreado={cargarUsuarios}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisMedio,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitulo: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "#FFEBEB",
    borderRadius: 10,
  },
  metricasRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: Colors.blanco,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    elevation: 1,
  },
  metricaNumero: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
  },
  metricaLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    marginTop: 2,
  },
  listaContainer: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 16,
  },
  usuarioCard: {
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
  usuarioCardBloqueado: {
    opacity: 0.7,
    borderColor: "#FFCCCC",
    borderLeftWidth: 4,
    borderLeftColor: Colors.rojoAlerta,
  },
  usuarioAvatarContainer: {
    position: "relative",
  },
  usuarioAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  usuarioAvatarLetra: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  bloqueadoIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.rojoAlerta,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  usuarioDatos: {
    flex: 1,
    gap: 4,
  },
  usuarioNombre: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisOscuro,
  },
  usuarioMetaRow: {
    flexDirection: "row",
    gap: 6,
  },
  rolChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rolChipTexto: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  bloqueadoChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#FFEBEB",
  },
  bloqueadoChipTexto: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: Colors.rojoAlerta,
  },
  administrarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.azulPrincipal,
  },
  administrarButtonTexto: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.azulPrincipal,
  },
  sinUsuarios: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  sinUsuariosTexto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.azulClaro,
    backgroundColor: Colors.fondoApp,
  },
  agregarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
  },
  agregarButtonTexto: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.blanco,
  },
});
