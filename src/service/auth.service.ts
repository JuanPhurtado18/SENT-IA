import { supabase } from "../lib/supabase";

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function registrarEstudiante(
  email: string,
  password: string,
  nombreCompleto: string,
  institucion: string,
  grado: string,
  fotoUri?: string,
) {
  const INSITUCION = "Rafael Navia Varon";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "estudiante",
        nombre_completo: nombreCompleto,
        institucion: INSITUCION,
        grado,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("No se pudo crear el usuario");

  if (fotoUri) {
    const fotoUrl = await subirAvatar(data.user.id, fotoUri);
    await actualizarFotoUrl(data.user.id, fotoUrl);
  }

  return data;
}

export async function obtenerPerfil(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, nombre_completo, institucion, grado, foto_url")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

import * as FileSystem from "expo-file-system/legacy";

export async function subirAvatar(
  userId: string,
  fotoUri: string,
): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${filePath}`;

  const uploadResult = await FileSystem.uploadAsync(uploadUrl, fotoUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
  });

  console.log("Upload status:", uploadResult.status);
  console.log("Upload body:", uploadResult.body);

  if (uploadResult.status !== 200 && uploadResult.status !== 201) {
    throw new Error(`Error subiendo imagen: ${uploadResult.body}`);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return `${data.publicUrl}?t=${Date.now()}`;
}
export async function actualizarFotoUrl(userId: string, fotoUrl: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ foto_url: fotoUrl })
    .eq("id", userId);

  if (error) throw error;
}

export async function enviarEmailRecuperacion(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "sentia://recuperar-password",
  });
  if (error) throw error;
}

export async function enviarCodigoRecuperacion(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: undefined,
  });
  if (error) throw error;
}

export async function verificarCodigoOTP(
  email: string,
  token: string,
): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
  if (error) throw error;
}

export async function actualizarPassword(nuevaPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: nuevaPassword,
  });
  if (error) throw error;
}

export async function registrarEstadoEmocional(
  usuarioId: string,
  estado: number,
) {
  const hoy = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("registro_emocional")
    .upsert(
      { usuario_id: usuarioId, estado, fecha: hoy },
      { onConflict: "usuario_id,fecha" },
    );

  if (error) throw error;
}

export async function obtenerEstadoEmocionalHoy(
  usuarioId: string,
): Promise<number | null> {
  const hoy = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registro_emocional")
    .select("estado")
    .eq("usuario_id", usuarioId)
    .eq("fecha", hoy)
    .single();

  if (error) return null;
  return data.estado;
}

export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
) {
  // Supabase no tiene un endpoint directo para verificar la contraseña actual
  // La forma correcta es re-autenticar al usuario con su email y contraseña actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No se pudo obtener el usuario actual");

  // Verificamos la contraseña actual intentando un signIn
  const { error: errorVerificacion } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: passwordActual,
  });

  if (errorVerificacion) throw new Error("La contraseña actual es incorrecta");

  // Si la verificación pasó, actualizamos la contraseña
  const { error } = await supabase.auth.updateUser({
    password: passwordNueva,
  });

  if (error) throw error;
}

export async function actualizarPerfil(
  userId: string,
  nombreCompleto: string,
  fotoUri?: string,
) {
  // Si hay foto nueva, subirla primero
  let fotoUrl: string | undefined;
  if (fotoUri) {
    fotoUrl = await subirAvatar(userId, fotoUri);
  }

  // Actualizar el perfil con los datos nuevos
  const updates: Record<string, string> = { nombre_completo: nombreCompleto };
  if (fotoUrl) updates.foto_url = fotoUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}

export async function iniciarSesionConGoogleNativo(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  return data;
}
