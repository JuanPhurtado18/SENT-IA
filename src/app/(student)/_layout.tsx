import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

function HeaderLogo() {
  return (
    <View style={styles.headerLogoContainer}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.headerLogo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function StudentLayout() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <HeaderLogo />,

        headerStyle: {
          backgroundColor: Colors.blanco,
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },

        headerShadowVisible: false,

        headerTitleAlign: "left",
        tabBarActiveTintColor: Colors.azulPrincipal,
        tabBarInactiveTintColor: Colors.grisMedio,
        tabBarStyle: {
          backgroundColor: Colors.blanco,
          borderTopWidth: 1,
          borderTopColor: Colors.azulClaro,
          paddingBottom,
          paddingTop: 8,
          height: 56 + paddingBottom,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="actividades"
        options={{
          title: "Actividades",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-open-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="actividad"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="finalizacion"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    width: 85,
    height: 85,
  },
});
