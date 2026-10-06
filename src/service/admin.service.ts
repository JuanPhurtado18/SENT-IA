import { supabase } from "../lib/supabase";

export async function crearDocente(
  email: string,
  password: string,
  nombreCompleto: string,
) {
  console.log("Llamando admin-crear-docente con:", { email, nombreCompleto });

  const { data, error } = await supabase.functions.invoke(
    "admin-crear-docente",
    {
      body: { email, password, nombreCompleto },
    },
  );

  console.log("Respuesta:", { data, error });

  if (error) throw new Error(error.message || "Error al crear docente");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function obtenerTodosLosUsuarios() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre_completo, role, grado, institucion, bloqueado, email")
    .in("role", ["estudiante", "docente"])
    .order("role")
    .order("nombre_completo");

  if (error) throw error;
  return data;
}

export async function bloquearPerfil(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ bloqueado: true })
    .eq("id", userId);
  if (error) throw error;

  const { error: signOutError } = await supabase.functions.invoke(
    "admin-bloquear-usuario",
    { body: { userId, accion: "bloquear" } },
  );
  if (signOutError) throw signOutError;
}

export async function desbloquearPerfil(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ bloqueado: false })
    .eq("id", userId);
  if (error) throw error;

  // Al desbloquear no hay que cerrar sesión — solo actualizar el campo
  // La Edge Function se llama igualmente para consistencia pero con accion: "desbloquear"
  const { error: fnError } = await supabase.functions.invoke(
    "admin-bloquear-usuario",
    { body: { userId, accion: "desbloquear" } },
  );
  if (fnError) throw fnError;
}
