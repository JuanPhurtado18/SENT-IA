import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.azulPrincipal,
        tabBarInactiveTintColor: Colors.grisMedio,
        tabBarStyle: {
          backgroundColor: Colors.blanco,
          borderTopWidth: 1,
          borderTopColor: Colors.azulClaro,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
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
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
