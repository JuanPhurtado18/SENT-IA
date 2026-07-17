import { supabase } from "../lib/supabase";

export async function obtenerActividadActiva() {
  const { data, error } = await supabase
    .from("actividades")
    .select("id, numero_semana, anio, fecha_cierre, estado")
    .eq("estado", "activa")
    .order("numero_semana", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function obtenerHistorialActividades(usuarioId: string) {
  const { data: actividades, error: errorAct } = await supabase
    .from("actividades")
    .select("id, numero_semana, anio, estado")
    .eq("anio", 2026)
    .order("numero_semana", { ascending: false })
    .limit(10);

  if (errorAct || !actividades) return [];

  const actividadesConConteo = await Promise.all(
    actividades.map(async (actividad) => {
      const { data: sits } = await supabase
        .from("situaciones")
        .select("id")
        .eq("actividad_id", actividad.id);

      if (!sits || sits.length === 0) {
        return { ...actividad, totalRespuestas: 0 };
      }

      const sitsIds = sits.map((s) => s.id);

      const { count } = await supabase
        .from("respuestas")
        .select("id", { count: "exact" })
        .eq("usuario_id", usuarioId)
        .in("situacion_id", sitsIds);

      return { ...actividad, totalRespuestas: count || 0 };
    }),
  );

  return actividadesConConteo.filter(
    (a) => a.estado === "activa" || a.totalRespuestas > 0,
  );
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

export async function obtenerResumenActividad(
  usuarioId: string,
  actividadId: string,
) {
  const { data: situaciones, error: errorSit } = await supabase
    .from("situaciones")
    .select("id")
    .eq("actividad_id", actividadId);

  if (errorSit || !situaciones) return null;

  const situacionIds = situaciones.map((s) => s.id);

  const { data: respuestas, error: errorResp } = await supabase
    .from("respuestas")
    .select("tiempo_respuesta_segundos")
    .eq("usuario_id", usuarioId)
    .in("situacion_id", situacionIds);

  if (errorResp || !respuestas) return null;

  const tiempoTotalSegundos = respuestas.reduce(
    (acc, r) => acc + r.tiempo_respuesta_segundos,
    0,
  );

  return {
    situacionesRespondidas: respuestas.length,
    totalSituaciones: situaciones.length,
    tiempoTotalSegundos,
  };
}

export async function obtenerTodasLasActividades(usuarioId: string) {
  const { data: actividades, error } = await supabase
    .from("actividades")
    .select("id, numero_semana, anio, fecha_publicacion, fecha_cierre, estado")
    .eq("anio", 2026)
    .order("numero_semana", { ascending: true });

  if (error || !actividades) return [];

  // Para cada actividad, verificar si el estudiante ya la completó
  const actividadesConEstado = await Promise.all(
    actividades.map(async (actividad) => {
      const { data: situaciones } = await supabase
        .from("situaciones")
        .select("id")
        .eq("actividad_id", actividad.id);

      if (!situaciones || situaciones.length === 0) {
        return { ...actividad, completada: false, respuestasCount: 0 };
      }

      const situacionIds = situaciones.map((s) => s.id);

      const { count } = await supabase
        .from("respuestas")
        .select("id", { count: "exact" })
        .eq("usuario_id", usuarioId)
        .in("situacion_id", situacionIds);

      const respuestasCount = count || 0;
      const completada = respuestasCount >= 10;

      return { ...actividad, completada, respuestasCount };
    }),
  );

  return actividadesConEstado;
}
