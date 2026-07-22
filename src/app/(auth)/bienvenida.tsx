import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";

export default function BienvenidaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.fondoApp} />

      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logoImagen}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SENT-IA</Text>
        <Text style={styles.slogan}>Bienestar emocional estudiantil</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push("/(auth)/registro-paso1")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Registrarse</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacyContainer}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={14}
          color={Colors.grisMedio}
        />
        <Text style={styles.privacyText}>Privacidad garantizada</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoImagen: {
    width: 500,
    height: 500,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
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
    borderWidth: 2,
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
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
});
