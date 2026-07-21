import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function EstudiantesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Estudiantes — próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: "Poppins_400Regular", color: Colors.grisMedio },
});
