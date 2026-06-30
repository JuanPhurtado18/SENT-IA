import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { cerrarSesion } from "../../service/auth.service";

export default function TeacherDashboard() {
  async function handleCerrarSesion() {
    try {
      await cerrarSesion();
      // La redirección a bienvenida la maneja el _layout.tsx raíz automáticamente
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cerrar sesión.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard docente — próximamente</Text>

      <TouchableOpacity
        style={styles.buttonLogout}
        onPress={handleCerrarSesion}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="logout"
          size={18}
          color={Colors.rojoAlerta}
        />
        <Text style={styles.buttonLogoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  text: {
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  buttonLogout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.rojoAlerta,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonLogoutText: {
    color: Colors.rojoAlerta,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});
