import { supabase } from "../lib/supabase";

export async function obtenerEstadisticasDocente() {
  // Total estudiantes sin importar institución
  const { count: totalEstudiantes } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("role", "estudiante");

  // Alertas activas
  const { count: totalAlertas } = await supabase
    .from("alertas")
    .select("id", { count: "exact" })
    .eq("estado", "activa");

  // Estudiantes que han realizado al menos una actividad
  // (tienen al menos una respuesta en cualquier actividad)
  const { data: respuestas } = await supabase
    .from("respuestas")
    .select("usuario_id");

  let activosEstaSemana = 0;
  if (respuestas && respuestas.length > 0) {
    const uniqueIds = new Set(respuestas.map((r) => r.usuario_id));
    activosEstaSemana = uniqueIds.size;
  }

  return {
    totalEstudiantes: totalEstudiantes || 0,
    totalAlertas: totalAlertas || 0,
    activosEstaSemana,
  };
}

export async function obtenerEstudiantesRecientes(institucion: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre_completo, grado, foto_url")
    .eq("role", "estudiante")
    .eq("institucion", institucion)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];
  return data;
}
