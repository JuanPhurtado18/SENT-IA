import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function TabOneScreen() {
  const [status, setStatus] = useState("Probando conexión...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus(`Error: ${error.message}`);
        console.log("Error de conexión:", error);
        return;
      }

      setStatus("Conectado a Supabase correctamente ✅");
      console.log("Sesión actual:", data.session);
    }

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FF",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
