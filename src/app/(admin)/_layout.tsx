import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 8);

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
        name="dashboard"
        options={{
          title: "Usuarios",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-cog-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
