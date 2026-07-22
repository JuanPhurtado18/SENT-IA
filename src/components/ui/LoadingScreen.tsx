import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  mensaje?: string;
}

export default function LoadingScreen({ mensaje = "Cargando..." }: Props) {
  const rotacion = useRef(new Animated.Value(0)).current;
  const escala1 = useRef(new Animated.Value(1)).current;
  const escala2 = useRef(new Animated.Value(0.6)).current;
  const escala3 = useRef(new Animated.Value(0.3)).current;
  const opacidadPuntos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de rotación continua del círculo exterior
    Animated.loop(
      Animated.timing(rotacion, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Animación de pulso del círculo central
    Animated.loop(
      Animated.sequence([
        Animated.timing(escala1, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(escala1, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animación de los puntos de carga con delay escalonado
    Animated.loop(
      Animated.sequence([
        Animated.timing(escala2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(escala3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(escala2, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(escala3, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ]),
    ).start();

    // Animación de aparición del texto
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacidadPuntos, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacidadPuntos, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotacionInterpolada = rotacion.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* CÍRCULO EXTERIOR GIRATORIO */}
      <View style={styles.animacionContainer}>
        <Animated.View
          style={[
            styles.circuloExterior,
            { transform: [{ rotate: rotacionInterpolada }] },
          ]}
        />

        {/* CÍRCULO MEDIO */}
        <View style={styles.circuloMedio} />

        {/* CÍRCULO CENTRAL CON PULSO */}
        <Animated.View
          style={[styles.circuloCentral, { transform: [{ scale: escala1 }] }]}
        >
          <Text style={styles.logoTexto}>S</Text>
        </Animated.View>

        {/* PUNTOS ORBITANDO */}
        <Animated.View
          style={[
            styles.punto,
            styles.punto1,
            { transform: [{ scale: escala2 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.punto,
            styles.punto2,
            { transform: [{ scale: escala3 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.punto,
            styles.punto3,
            { transform: [{ scale: escala2 }] },
          ]}
        />
      </View>

      {/* TEXTO DE CARGA */}
      <Animated.Text style={[styles.mensajeTexto, { opacity: opacidadPuntos }]}>
        {mensaje}
      </Animated.Text>

      <Text style={styles.marcaTexto}>SENT-IA</Text>
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
  animacionContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circuloExterior: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.azulPrincipal,
    borderTopColor: Colors.lilaAcento,
    borderRightColor: Colors.azulClaro,
  },
  circuloMedio: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: Colors.azulClaro,
    borderStyle: "dashed",
  },
  circuloCentral: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.azulPrincipal,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.azulPrincipal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoTexto: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  punto: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.lilaAcento,
  },
  punto1: {
    top: 0,
    left: "50%",
    marginLeft: -5,
  },
  punto2: {
    bottom: 8,
    right: 8,
    backgroundColor: Colors.azulPrincipal,
  },
  punto3: {
    bottom: 8,
    left: 8,
    backgroundColor: Colors.verdePrincipal,
  },
  mensajeTexto: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisMedio,
  },
  marcaTexto: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulClaro,
    letterSpacing: 3,
  },
});
