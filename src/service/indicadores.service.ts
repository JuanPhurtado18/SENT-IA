import { supabase } from "../lib/supabase";

const CLOUDFLARE_WORKER_URL = "https://nvidia-proxy.sentia2807.workers.dev";

export async function procesarActividad(
  usuarioId: string,
  actividadId: string,
): Promise<void> {
  // 1. Obtener situaciones de la actividad
  const { data: situaciones, error: errorSit } = await supabase
    .from("situaciones")
    .select(
      "id, area, orden, contexto, pregunta, opcion_a, opcion_b, opcion_c, opcion_d",
    )
    .eq("actividad_id", actividadId)
    .order("orden");

  if (errorSit || !situaciones) throw new Error("Error obteniendo situaciones");

  const situacionIds = situaciones.map((s) => s.id);

  // 2. Obtener respuestas del estudiante
  const { data: respuestas, error: errorResp } = await supabase
    .from("respuestas")
    .select("situacion_id, opcion_seleccionada, tiempo_respuesta_segundos")
    .eq("usuario_id", usuarioId)
    .in("situacion_id", situacionIds);

  if (errorResp || !respuestas) throw new Error("Error obteniendo respuestas");

  // 3. Obtener perfil del estudiante
  const { data: perfil } = await supabase
    .from("profiles")
    .select("grado")
    .eq("id", usuarioId)
    .single();

  // 4. Llamar al Worker de Cloudflare para análisis de IA
  const workerResponse = await fetch(CLOUDFLARE_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      situaciones,
      respuestas,
      grado: perfil?.grado ?? "secundaria",
    }),
  });

  if (!workerResponse.ok) {
    const errorText = await workerResponse.text();
    throw new Error(`Error en análisis de IA: ${errorText}`);
  }

  const resultado = (await workerResponse.json()) as {
    indicadoresPorArea: Record<string, { puntuacion: number; nivel: string }>;
    nivelGeneral: string;
    puntuacionGeneral: number;
    resumenIA: string;
  };

  // 5. Guardar resultados en la BD via Edge Function
  const { error: errorEdge } = await supabase.functions.invoke(
    "calcular-indicadores",
    {
      body: {
        usuario_id: usuarioId,
        actividad_id: actividadId,
        indicadoresPorArea: resultado.indicadoresPorArea,
        nivelGeneral: resultado.nivelGeneral,
        puntuacionGeneral: resultado.puntuacionGeneral,
        resumenIA: resultado.resumenIA,
      },
    },
  );

  if (errorEdge)
    throw new Error(`Error guardando indicadores: ${errorEdge.message}`);
}

export async function obtenerIndicadoresEstudiante(estudianteId: string) {
  // Primero obtenemos la actividad más reciente con indicadores
  const { data: ultimoIndicador, error: errorUltimo } = await supabase
    .from("indicadores")
    .select("actividad_id, created_at")
    .eq("usuario_id", estudianteId)
    .is("area", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (errorUltimo || !ultimoIndicador) return [];

  // Traemos todos los indicadores de esa actividad
  const { data, error } = await supabase
    .from("indicadores")
    .select("area, nivel, puntuacion, resumen_ia, created_at, actividad_id")
    .eq("usuario_id", estudianteId)
    .eq("actividad_id", ultimoIndicador.actividad_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function obtenerTendenciaEstudiante(estudianteId: string) {
  // Traemos los últimos 8 indicadores generales (area = null), uno por actividad
  const { data, error } = await supabase
    .from("indicadores")
    .select("puntuacion, nivel, created_at, actividad_id")
    .eq("usuario_id", estudianteId)
    .is("area", null)
    .order("created_at", { ascending: true })
    .limit(8);

  if (error || !data) return [];

  return data.map((item: any, index: number) => ({
    semana: `Sem ${index + 1}`,
    valor: Number(item.puntuacion) / 100,
    nivel: item.nivel,
    fecha: item.created_at,
  }));
}
