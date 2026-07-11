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

export async function obtenerSituacionesDeActividad(actividadId: string) {
  const { data, error } = await supabase
    .from("situaciones")
    .select(
      "id, area, orden, contexto, pregunta, opcion_a, opcion_b, opcion_c, opcion_d",
    )
    .eq("actividad_id", actividadId)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

export async function obtenerRespuestasExistentes(
  usuarioId: string,
  actividadId: string,
) {
  const { data: situaciones, error: errorSit } = await supabase
    .from("situaciones")
    .select("id")
    .eq("actividad_id", actividadId);

  if (errorSit || !situaciones) return {};

  const situacionIds = situaciones.map((s) => s.id);

  const { data, error } = await supabase
    .from("respuestas")
    .select("situacion_id, opcion_seleccionada")
    .eq("usuario_id", usuarioId)
    .in("situacion_id", situacionIds);

  if (error) return {};

  const mapa: Record<string, string> = {};
  data.forEach((r) => {
    mapa[r.situacion_id] = r.opcion_seleccionada;
  });
  return mapa;
}

export async function guardarRespuesta(
  usuarioId: string,
  situacionId: string,
  opcion: string,
  tiempoSegundos: number,
) {
  const { error } = await supabase.from("respuestas").upsert(
    {
      usuario_id: usuarioId,
      situacion_id: situacionId,
      opcion_seleccionada: opcion,
      tiempo_respuesta_segundos: tiempoSegundos,
    },
    { onConflict: "usuario_id,situacion_id" },
  );

  if (error) throw error;
}
