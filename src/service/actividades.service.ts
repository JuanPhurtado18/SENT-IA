import { supabase } from "../lib/supabase";

export async function obtenerActividadActiva() {
  const { data, error } = await supabase
    .from("actividades")
    .select("id, numero_semana, anio, fecha_cierre, estado")
    .eq("estado", "activa")
    .single();

  if (error) return null;
  return data;
}

export async function obtenerHistorialActividades(usuarioId: string) {
  const { data, error } = await supabase
    .from("actividades")
    .select(
      `
      id,
      numero_semana,
      anio,
      estado,
      respuestas!inner(usuario_id)
    `,
    )
    .eq("respuestas.usuario_id", usuarioId)
    .order("numero_semana", { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

export async function contarRespuestasDeActividad(
  usuarioId: string,
  actividadId: string,
): Promise<number> {
  const { data: situaciones, error: errorSituaciones } = await supabase
    .from("situaciones")
    .select("id")
    .eq("actividad_id", actividadId);

  if (errorSituaciones || !situaciones || situaciones.length === 0) return 0;

  const situacionIds = situaciones.map((s) => s.id);

  const { count, error } = await supabase
    .from("respuestas")
    .select("id", { count: "exact" })
    .eq("usuario_id", usuarioId)
    .in("situacion_id", situacionIds);

  if (error) return 0;
  return count || 0;
}
