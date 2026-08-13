import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  console.log("Edge Function iniciada:", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Body recibido:", JSON.stringify(body));

    const {
      usuario_id,
      actividad_id,
      indicadoresPorArea,
      nivelGeneral,
      puntuacionGeneral,
      resumenIA,
    } = body;

    if (!usuario_id || !actividad_id || !indicadoresPorArea) {
      return new Response(
        JSON.stringify({ error: "Parámetros requeridos faltantes" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Guardar indicadores por área
    const indicadoresParaInsertar = Object.entries(indicadoresPorArea).map(
      ([area, datos]: [string, any]) => ({
        usuario_id,
        actividad_id,
        area,
        nivel: datos.nivel,
        puntuacion: datos.puntuacion,
        resumen_ia: null,
      }),
    );

    // Agregar bienestar general
    indicadoresParaInsertar.push({
      usuario_id,
      actividad_id,
      area: null,
      nivel: nivelGeneral,
      puntuacion: puntuacionGeneral,
      resumen_ia: resumenIA,
    });

    console.log("Guardando indicadores:", indicadoresParaInsertar.length);

    // Borrar indicadores anteriores de esta actividad
    await supabase
      .from("indicadores")
      .delete()
      .eq("usuario_id", usuario_id)
      .eq("actividad_id", actividad_id);

    // Insertar los nuevos
    const { error: errorIndicadores } = await supabase
      .from("indicadores")
      .insert(indicadoresParaInsertar);

    if (errorIndicadores) {
      throw new Error(
        `Error guardando indicadores: ${errorIndicadores.message}`,
      );
    }

    // Verificar y generar alertas
    await verificarYGenerarAlertas(
      supabase,
      usuario_id,
      actividad_id,
      indicadoresPorArea,
      puntuacionGeneral,
    );

    console.log("Proceso completado");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function verificarYGenerarAlertas(
  supabase: any,
  usuarioId: string,
  actividadId: string,
  indicadoresPorArea: Record<string, { puntuacion: number; nivel: string }>,
  puntuacionGeneral: number,
) {
  const { data: historial } = await supabase
    .from("indicadores")
    .select("area, nivel, puntuacion, created_at")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!historial) return;

  const alertasParaInsertar: any[] = [];

  for (const [area, datos] of Object.entries(indicadoresPorArea)) {
    if (datos.nivel === "prioritario") {
      const historialArea = historial
        .filter((h: any) => h.area === area)
        .slice(0, 3);

      const tresSemanas =
        historialArea.length >= 2 &&
        historialArea.every((h: any) => h.nivel === "prioritario");

      if (tresSemanas) {
        alertasParaInsertar.push({
          usuario_id: usuarioId,
          tipo: "prioritaria",
          descripcion: `Indicador de área ${area} en nivel prioritario por 3 o más semanas consecutivas.`,
          estado: "activa",
        });
      }
    }

    if (datos.nivel === "seguimiento") {
      const historialArea = historial
        .filter((h: any) => h.area === area)
        .slice(0, 2);

      const dosSemanas =
        historialArea.length >= 1 &&
        historialArea.every(
          (h: any) => h.nivel === "seguimiento" || h.nivel === "prioritario",
        );

      if (dosSemanas) {
        alertasParaInsertar.push({
          usuario_id: usuarioId,
          tipo: "seguimiento",
          descripcion: `Indicador de área ${area} en nivel seguimiento por 2 semanas consecutivas.`,
          estado: "activa",
        });
      }
    }
  }

  const ultimoGeneral = historial.find((h: any) => h.area === null);
  if (ultimoGeneral) {
    const caida = ultimoGeneral.puntuacion - puntuacionGeneral;
    if (caida >= 30) {
      alertasParaInsertar.push({
        usuario_id: usuarioId,
        tipo: "bienestar_general",
        descripcion: `Caída significativa en el bienestar general: de ${ultimoGeneral.puntuacion} a ${puntuacionGeneral} puntos.`,
        estado: "activa",
      });
    }
  }

  // DESPUÉS:
  if (alertasParaInsertar.length > 0) {
    const { data: alertasExistentes } = await supabase
      .from("alertas")
      .select("tipo, descripcion")
      .eq("usuario_id", usuarioId)
      .eq("estado", "activa");

    const alertasNuevas = alertasParaInsertar.filter((nueva) => {
      return !alertasExistentes?.some(
        (existente: any) =>
          existente.tipo === nueva.tipo &&
          existente.descripcion === nueva.descripcion,
      );
    });

    if (alertasNuevas.length > 0) {
      console.log("Generando alertas:", alertasNuevas.length);
      await supabase.from("alertas").insert(alertasNuevas);
    }
  }
}
