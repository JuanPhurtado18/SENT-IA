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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "estudiante",
        nombre_completo: nombreCompleto,
        institucion,
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

export async function subirAvatar(
  userId: string,
  fotoUri: string,
): Promise<string> {
  const extension = fotoUri.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${userId}/avatar.${extension}`;
  const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;

  const response = await fetch(fotoUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, arrayBuffer, {
      contentType: contentType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
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
