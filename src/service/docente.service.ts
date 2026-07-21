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

export async function obtenerTodosLosEstudiantes() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre_completo, grado, institucion, foto_url")
    .eq("role", "estudiante")
    .order("nombre_completo", { ascending: true });

  if (error || !data) return [];

  // Para cada estudiante obtenemos su estado en la actividad activa
  const { data: actividadActiva } = await supabase
    .from("actividades")
    .select("id, numero_semana")
    .eq("estado", "activa")
    .order("numero_semana", { ascending: true })
    .limit(1);

  if (!actividadActiva || actividadActiva.length === 0) {
    return data.map((e) => ({
      ...e,
      estadoSemana: "sin_actividad",
      nivelAlerta: null,
    }));
  }

  const actividad = actividadActiva[0];

  const { data: situaciones } = await supabase
    .from("situaciones")
    .select("id")
    .eq("actividad_id", actividad.id);

  const situacionIds = situaciones?.map((s) => s.id) || [];

  const estudiantesConEstado = await Promise.all(
    data.map(async (estudiante) => {
      // Contamos respuestas del estudiante en la actividad activa
      let estadoSemana = "pendiente";

      if (situacionIds.length > 0) {
        const { count } = await supabase
          .from("respuestas")
          .select("id", { count: "exact" })
          .eq("usuario_id", estudiante.id)
          .in("situacion_id", situacionIds);

        if ((count || 0) >= 10) estadoSemana = "completada";
        else if ((count || 0) > 0) estadoSemana = "en_progreso";
        else estadoSemana = "pendiente";
      }

      // Verificamos si tiene alertas activas
      const { data: alertas } = await supabase
        .from("alertas")
        .select("tipo")
        .eq("usuario_id", estudiante.id)
        .eq("estado", "activa")
        .order("created_at", { ascending: false })
        .limit(1);

      const nivelAlerta =
        alertas && alertas.length > 0 ? alertas[0].tipo : null;

      return { ...estudiante, estadoSemana, nivelAlerta };
    }),
  );

  return estudiantesConEstado;
}
