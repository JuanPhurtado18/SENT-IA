import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="bienvenida" />
      <Stack.Screen name="login" />
      <Stack.Screen name="registro-paso1" />
      <Stack.Screen name="registro-paso2" />
      <Stack.Screen name="recuperar-password" />
      <Stack.Screen name="nueva-password" />
    </Stack>
  );
}
