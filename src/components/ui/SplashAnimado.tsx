import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

const PARTICULAS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  yInicio: Math.random() * height,
  size: Math.random() * 8 + 3,
  delay: Math.random() * 1500,
  duration: Math.random() * 2000 + 3500,
  opacidad: Math.random() * 0.45 + 0.15,
  color:
    i % 3 === 0
      ? Colors.azulPrincipal
      : i % 3 === 1
        ? Colors.lilaAcento
        : "#A8D8EA",
}));

function Particula({
  x,
  yInicio,
  size,
  delay,
  duration,
  opacidad,
  color,
}: (typeof PARTICULAS)[0]) {
  const y = useRef(new Animated.Value(yInicio)).current;
  const op = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: yInicio - height * 0.4,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.parallel([
              Animated.timing(op, {
                toValue: opacidad,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: duration * 0.3,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(op, {
              toValue: 0,
              duration: duration * 0.4,
              delay: duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y, {
            toValue: yInicio,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: y }, { scale }],
      }}
    />
  );
}

function AnilloPulso({
  delay,
  color,
  size,
}: {
  delay: number;
  color: string;
  size: number;
}) {
  const escala = useRef(new Animated.Value(1)).current;
  const opacidad = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(escala, {
            toValue: 2.8,
            duration: 3000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacidad, {
            toValue: 0,
            duration: 3000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(escala, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacidad, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity: opacidad,
        transform: [{ scale: escala }],
      }}
    />
  );
}

interface Props {
  onFinish: () => void;
}

export default function SplashAnimado({ onFinish }: Props) {
  const opacidadGeneral = useRef(new Animated.Value(1)).current;
  const opacidadLogo = useRef(new Animated.Value(0)).current;
  const escalaLogo = useRef(new Animated.Value(0.4)).current;
  const opacidadTexto = useRef(new Animated.Value(0)).current;
  const trasladoTexto = useRef(new Animated.Value(30)).current;
  const opacidadSlogan = useRef(new Animated.Value(0)).current;
  const opacidadAnillos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacidadLogo, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(escalaLogo, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(2.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacidadAnillos, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(escalaLogo, {
          toValue: 1.18,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(escalaLogo, {
          toValue: 0.93,
          duration: 160,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(escalaLogo, {
          toValue: 1.12,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(escalaLogo, {
          toValue: 1,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(opacidadTexto, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(trasladoTexto, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacidadSlogan, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(opacidadGeneral, {
        toValue: 0,
        duration: 800,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: opacidadGeneral }]}>
      {/* Fondo */}
      <View style={styles.fondoBase} />

      {/* Manchas */}
      <View
        style={[
          styles.mancha,
          {
            width: width * 0.9,
            height: width * 0.9,
            top: -width * 0.4,
            left: -width * 0.2,
            backgroundColor: "#DDE8FF",
          },
        ]}
      />
      <View
        style={[
          styles.mancha,
          {
            width: width * 0.8,
            height: width * 0.8,
            bottom: -width * 0.2,
            right: -width * 0.15,
            backgroundColor: "#E8E0FF",
          },
        ]}
      />
      <View
        style={[
          styles.mancha,
          {
            width: width * 0.5,
            height: width * 0.5,
            bottom: width * 0.05,
            left: -width * 0.1,
            backgroundColor: "#D0EFFF",
          },
        ]}
      />

      {/* Partículas */}
      {PARTICULAS.map((p) => (
        <Particula key={p.id} {...p} />
      ))}

      {/* Centro */}
      <View style={styles.centroContainer}>
        <Animated.View
          style={[styles.anillosWrapper, { opacity: opacidadAnillos }]}
        >
          <AnilloPulso delay={0} color={Colors.azulPrincipal} size={200} />
          <AnilloPulso delay={500} color={Colors.lilaAcento} size={200} />
          <AnilloPulso delay={1000} color="#A8D8EA" size={200} />
        </Animated.View>

        <Animated.Image
          source={require("../../../assets/images/logo.png")}
          style={[
            styles.logo,
            {
              opacity: opacidadLogo,
              transform: [{ scale: escalaLogo }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Texto */}
      <Animated.Text
        style={[
          styles.nombre,
          {
            opacity: opacidadTexto,
            transform: [{ translateY: trasladoTexto }],
          },
        ]}
      >
        SENT-IA
      </Animated.Text>

      <Animated.View style={[styles.sloganRow, { opacity: opacidadSlogan }]}>
        <View style={styles.linea} />
        <Text style={styles.slogan}>Bienestar emocional estudiantil</Text>
        <View style={styles.linea} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    paddingTop: height * 0.15,
  },
  fondoBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F0F5FF",
  },
  mancha: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  centroContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
    marginTop: -40,
  },
  anillosWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
  },
  logo: {
    width: 190,
    height: 190,
    zIndex: 10,
  },
  nombre: {
    fontSize: 34,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
    letterSpacing: 6,
    marginTop: 36,
  },
  sloganRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  linea: {
    width: 28,
    height: 1.5,
    backgroundColor: Colors.grisMedio,
    opacity: 0.4,
  },
  slogan: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    letterSpacing: 0.5,
  },
});
