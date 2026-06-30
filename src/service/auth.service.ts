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
